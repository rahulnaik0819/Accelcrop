import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api, type TelemetryResponse, MOCK_TELEMETRY } from '../services/api';

export type DrawingMode = 'inspect' | 'square' | 'rectangle' | 'delete';

export interface FarmLocation {
  name: string;
  state?: string;
  country?: string;
  lat: number;
  lng: number;
  zoom?: number;
}

export interface FieldItem {
  id: string;
  name: string;
  polygonCoords: [number, number][];
  areaAcres: number;
  cropType: string;
  moisturePercent: number;
  soilPh: number;
  ndviScore: number;
  healthStatus: 'Optimal' | 'Below Optimal' | 'Critical';
  predictedYieldTonnesPerHa?: number;
  totalProductionTonnes?: number;
  targetYieldTonnesPerHa?: number;
  sowingDate?: string;
}

export const DEFAULT_FARM_LOCATION: FarmLocation = {
  name: 'Ludhiana Farmlands',
  state: 'Punjab',
  country: 'India',
  lat: 30.9010,
  lng: 75.8570,
  zoom: 15,
};

export const INITIAL_FIELDS: FieldItem[] = [
  {
    id: 'field-01',
    name: 'Field 01 (North Parcel)',
    polygonCoords: [
      [30.9035, 75.8520],
      [30.9035, 75.8570],
      [30.9005, 75.8570],
      [30.9005, 75.8520],
    ],
    areaAcres: 34.5,
    cropType: 'Wheat',
    moisturePercent: 28.4,
    soilPh: 6.4,
    ndviScore: 0.82,
    healthStatus: 'Optimal',
    predictedYieldTonnesPerHa: 45.2,
    totalProductionTonnes: 631.5,
    targetYieldTonnesPerHa: 48.0,
    sowingDate: '2025-11-15',
  },
  {
    id: 'field-02',
    name: 'Field 02 (East Ridge)',
    polygonCoords: [
      [30.9035, 75.8590],
      [30.9035, 75.8640],
      [30.9005, 75.8640],
      [30.9005, 75.8590],
    ],
    areaAcres: 32.0,
    cropType: 'Wheat',
    moisturePercent: 20.8,
    soilPh: 6.2,
    ndviScore: 0.75,
    healthStatus: 'Below Optimal',
    predictedYieldTonnesPerHa: 41.8,
    totalProductionTonnes: 541.3,
    targetYieldTonnesPerHa: 45.0,
    sowingDate: '2025-11-20',
  },
  {
    id: 'field-03',
    name: 'Field 03 (South Delta)',
    polygonCoords: [
      [30.8975, 75.8520],
      [30.8975, 75.8570],
      [30.8945, 75.8570],
      [30.8945, 75.8520],
    ],
    areaAcres: 36.5,
    cropType: 'Mustard',
    moisturePercent: 26.5,
    soilPh: 6.6,
    ndviScore: 0.90,
    healthStatus: 'Optimal',
    predictedYieldTonnesPerHa: 50.1,
    totalProductionTonnes: 739.8,
    targetYieldTonnesPerHa: 52.0,
    sowingDate: '2025-10-28',
  },
  {
    id: 'field-04',
    name: 'Field 04 (Canal Basin)',
    polygonCoords: [
      [30.8975, 75.8590],
      [30.8975, 75.8640],
      [30.8945, 75.8640],
      [30.8945, 75.8590],
    ],
    areaAcres: 25.0,
    cropType: 'Rice',
    moisturePercent: 15.2,
    soilPh: 5.9,
    ndviScore: 0.65,
    healthStatus: 'Critical',
    predictedYieldTonnesPerHa: 36.7,
    totalProductionTonnes: 371.3,
    targetYieldTonnesPerHa: 42.0,
    sowingDate: '2025-12-05',
  },
];

/**
 * Computes polygon acreage using spherical excess formula (Shoelace on sphere)
 */
export function calculatePolygonAcreage(coords: [number, number][]): number {
  if (!coords || coords.length < 3) return 5.0;
  const radius = 6378137; // Earth radius in meters
  const toRad = Math.PI / 180;
  let areaM2 = 0;

  if (coords.length > 2) {
    for (let i = 0; i < coords.length; i++) {
      const p1 = coords[i];
      const p2 = coords[(i + 1) % coords.length];
      areaM2 += (p2[1] - p1[1]) * toRad * (2 + Math.sin(p1[0] * toRad) + Math.sin(p2[0] * toRad));
    }
    areaM2 = Math.abs((areaM2 * radius * radius) / 2.0);
  }

  // Convert m^2 to acres (1 acre = 4046.856 m^2)
  const acres = areaM2 / 4046.8564224;
  return Math.max(0.5, Math.round(acres * 10) / 10);
}

interface FarmContextType {
  currentLocation: FarmLocation;
  farmLocation: FarmLocation;
  fields: FieldItem[];
  selectedFieldId: string;
  selectedField: FieldItem | undefined;
  telemetry: TelemetryResponse;
  loadingTelemetry: boolean;
  drawingMode: DrawingMode;
  activeDrawPoints: [number, number][];
  totalFarmAcres: number;
  totalProductionTonnes: number;
  setLocation: (location: FarmLocation) => void;
  searchAndSetLocation: (queryOrLocation: string | FarmLocation) => Promise<void>;
  selectField: (fieldId: string) => void;
  addField: (newField: Omit<FieldItem, 'id'>) => void;
  removeField: (fieldId: string) => void;
  updateField: (fieldId: string, updates: Partial<FieldItem>) => void;
  updateFieldTelemetry: (fieldId: string, telemetry: { moisture?: number; soilPh?: number; ndvi?: number }) => void;
  setDrawingMode: (mode: DrawingMode) => void;
  setActiveDrawPoints: (points: [number, number][]) => void;
  resetToDefaultFields: () => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function FarmProvider({ children }: { children: ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<FarmLocation>(() => {
    try {
      const saved = localStorage.getItem('agrivision_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number' && !isNaN(parsed.lat) && !isNaN(parsed.lng)) {
          return parsed;
        }
      }
      return DEFAULT_FARM_LOCATION;
    } catch {
      return DEFAULT_FARM_LOCATION;
    }
  });

  const [fields, setFields] = useState<FieldItem[]>(() => {
    try {
      const saved = localStorage.getItem('agrivision_fields_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0].polygonCoords) && parsed[0].polygonCoords.length > 2) {
          return parsed;
        }
      }
      return INITIAL_FIELDS;
    } catch {
      return INITIAL_FIELDS;
    }
  });

  const [selectedFieldId, setSelectedFieldId] = useState<string>('field-01');
  const [telemetry, setTelemetry] = useState<TelemetryResponse>(MOCK_TELEMETRY || {});
  const [loadingTelemetry, setLoadingTelemetry] = useState<boolean>(false);

  // Drawing toolbar mode
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('inspect');
  const [activeDrawPoints, setActiveDrawPoints] = useState<[number, number][]>([]);

  // Persist location & fields to localStorage
  useEffect(() => {
    if (currentLocation && typeof currentLocation.lat === 'number') {
      localStorage.setItem('agrivision_location', JSON.stringify(currentLocation));
    }
  }, [currentLocation]);

  useEffect(() => {
    if (Array.isArray(fields) && fields.length > 0) {
      localStorage.setItem('agrivision_fields_v2', JSON.stringify(fields));
    }
  }, [fields]);

  // Fetch telemetry whenever location changes
  useEffect(() => {
    async function loadTelemetry() {
      if (!currentLocation || typeof currentLocation.lat !== 'number' || typeof currentLocation.lng !== 'number') {
        return;
      }
      setLoadingTelemetry(true);
      try {
        const data = await api.fetchTelemetry({
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          crop: fields[0]?.cropType || 'Wheat',
          area_acres: fields.reduce((acc, f) => acc + (f.areaAcres || 0), 0) || 128,
        });
        if (data) {
          setTelemetry(data);
        }
      } catch (err) {
        console.error('[FarmContext] Error loading telemetry:', err);
      } finally {
        setLoadingTelemetry(false);
      }
    }
    loadTelemetry();
  }, [currentLocation?.lat, currentLocation?.lng, fields]);

  const selectedField =
    fields.find((f) => f.id === selectedFieldId || f.name === selectedFieldId) || fields[0];

  const totalFarmAcres = Math.round(fields.reduce((acc, f) => acc + (f.areaAcres || 0), 0) * 10) / 10;
  const totalProductionTonnes =
    Math.round(
      fields.reduce(
        (acc, f) =>
          acc +
          (f.totalProductionTonnes ||
            (f.areaAcres || 0) * 0.404686 * (f.predictedYieldTonnesPerHa || 45.2)),
        0
      ) * 10
    ) / 10;

  const setLocation = (loc: FarmLocation) => {
    if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return;
    setCurrentLocation(loc);
    repositionFieldsToCenter(loc.lat, loc.lng);
  };

  const searchAndSetLocation = async (queryOrLocation: string | FarmLocation) => {
    if (typeof queryOrLocation === 'object') {
      setLocation(queryOrLocation);
      return;
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        queryOrLocation
      )}&limit=1&addressdetails=1`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'AgriVision-Platform/2.0' },
      });
      const results = await res.json();
      if (results && results.length > 0) {
        const item = results[0];
        const address = item.address || {};
        const newLoc: FarmLocation = {
          name:
            address.village ||
            address.town ||
            address.city ||
            address.county ||
            item.display_name.split(',')[0],
          state: address.state || address.region || '',
          country: address.country || '',
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          zoom: 15,
        };
        setLocation(newLoc);
      }
    } catch (err) {
      console.error('[FarmContext] Geocoding failed:', err);
    }
  };

  const repositionFieldsToCenter = (centerLat: number, centerLng: number) => {
    setFields((prev) =>
      prev.map((f, idx) => {
        const latOffset = idx < 2 ? 0.0025 : -0.0025;
        const lngOffset = idx % 2 === 0 ? -0.0035 : 0.0035;
        return {
          ...f,
          polygonCoords: [
            [centerLat + latOffset + 0.0015, centerLng + lngOffset - 0.0025],
            [centerLat + latOffset + 0.0015, centerLng + lngOffset + 0.0025],
            [centerLat + latOffset - 0.0015, centerLng + lngOffset + 0.0025],
            [centerLat + latOffset - 0.0015, centerLng + lngOffset - 0.0025],
          ],
        };
      })
    );
  };

  const selectField = (fieldId: string) => {
    const match = fields.find((f) => f.id === fieldId || f.name === fieldId);
    if (match) {
      setSelectedFieldId(match.id);
    }
  };

  const addField = (newFieldData: Omit<FieldItem, 'id'>) => {
    const newId = `field-${String(fields.length + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
    const fieldToAdd: FieldItem = {
      ...newFieldData,
      id: newId,
    };
    setFields((prev) => [...prev, fieldToAdd]);
    setSelectedFieldId(newId);
  };

  const removeField = (fieldId: string) => {
    setFields((prev) => {
      const remaining = prev.filter((f) => f.id !== fieldId && f.name !== fieldId);
      if (remaining.length > 0 && (selectedFieldId === fieldId || selectedField?.id === fieldId)) {
        setSelectedFieldId(remaining[0].id);
      }
      return remaining;
    });
  };

  const updateField = (fieldId: string, updates: Partial<FieldItem>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId || f.name === fieldId ? { ...f, ...updates } : f))
    );
  };

  const updateFieldTelemetry = (
    fieldId: string,
    tel: { moisture?: number; soilPh?: number; ndvi?: number }
  ) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== fieldId && f.name !== fieldId) return f;
        const moisture = tel.moisture ?? f.moisturePercent;
        const ph = tel.soilPh ?? f.soilPh;
        const ndvi = tel.ndvi ?? f.ndviScore;
        const health: 'Optimal' | 'Below Optimal' | 'Critical' =
          moisture < 16.0 || ph < 5.8 || ph > 8.0
            ? 'Critical'
            : moisture < 22.0 || ph < 6.1
            ? 'Below Optimal'
            : 'Optimal';

        return {
          ...f,
          moisturePercent: moisture,
          soilPh: ph,
          ndviScore: ndvi,
          healthStatus: health,
        };
      })
    );
  };

  const resetToDefaultFields = () => {
    setFields(INITIAL_FIELDS);
    setSelectedFieldId('field-01');
    setCurrentLocation(DEFAULT_FARM_LOCATION);
  };

  return (
    <FarmContext.Provider
      value={{
        currentLocation,
        farmLocation: currentLocation,
        fields,
        selectedFieldId,
        selectedField,
        telemetry,
        loadingTelemetry,
        drawingMode,
        activeDrawPoints,
        totalFarmAcres,
        totalProductionTonnes,
        setLocation,
        searchAndSetLocation,
        selectField,
        addField,
        removeField,
        updateField,
        updateFieldTelemetry,
        setDrawingMode,
        setActiveDrawPoints,
        resetToDefaultFields,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}
