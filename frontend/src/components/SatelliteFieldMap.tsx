import { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Popup,
  LayersControl,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Search,
  MapPin,
  Sparkles,
  Droplets,
  CloudSun,
  Gauge,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { useFarm, type FieldItem, calculatePolygonAcreage } from '../context/FarmContext';
import { useTheme } from '../context/ThemeContext';
import { searchWorldwideLocations, type GeocodingResult } from '../services/geocoding';
import MapController from './MapController';
import DrawingControls from './DrawingControls';
import CreateFieldModal from './CreateFieldModal';

// Fix Leaflet default icon broken with Vite bundlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function getFieldColor(field: FieldItem, isNight: boolean): string {
  if (field.healthStatus === 'Critical' || field.moisturePercent < 16 || field.ndviScore < 0.6) {
    return isNight ? '#f43f5e' : '#ef4444'; // neon rose / red-500
  }
  if (
    field.healthStatus === 'Below Optimal' ||
    field.moisturePercent < 22 ||
    field.ndviScore < 0.75
  ) {
    return isNight ? '#fbbf24' : '#f59e0b'; // neon amber
  }
  if (field.ndviScore >= 0.85) {
    return isNight ? '#00f2fe' : '#10b981'; // electric cyan / emerald-500
  }
  return isNight ? '#10b981' : '#22c55e'; // emerald / green-500
}

// Handles user map clicks according to active drawing mode
function MapDrawingHandler({
  onSquarePlaced,
  onRectangleCorner,
}: {
  onSquarePlaced: (center: [number, number]) => void;
  onRectangleCorner: (pt: [number, number]) => void;
}) {
  const { drawingMode } = useFarm();

  useMapEvents({
    click(e) {
      const pt: [number, number] = [e.latlng.lat, e.latlng.lng];
      if (drawingMode === 'square') {
        onSquarePlaced(pt);
      } else if (drawingMode === 'rectangle') {
        onRectangleCorner(pt);
      }
    },
  });
  return null;
}

interface SatelliteFieldMapProps {
  height?: string;
  isCompact?: boolean;
  onOpenOptimizer?: () => void;
  onOpenWaterLogger?: () => void;
}

export default function SatelliteFieldMap({
  height = '100%',
  isCompact = false,
  onOpenOptimizer,
  onOpenWaterLogger,
}: SatelliteFieldMapProps) {
  const { isNight } = useTheme();
  const {
    currentLocation,
    fields,
    selectedFieldId,
    selectField,
    removeField,
    addField,
    telemetry,
    setLocation,
    drawingMode,
    setDrawingMode,
    activeDrawPoints,
    setActiveDrawPoints,
  } = useFarm();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);

  // Modal for saving new custom parcel
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<[number, number][]>([]);
  const [pendingAcres, setPendingAcres] = useState<number>(5.0);

  const centerLat =
    typeof currentLocation?.lat === 'number' && !isNaN(currentLocation.lat)
      ? currentLocation.lat
      : 30.901;
  const centerLng =
    typeof currentLocation?.lng === 'number' && !isNaN(currentLocation.lng)
      ? currentLocation.lng
      : 75.857;
  const center: [number, number] = [centerLat, centerLng];

  // Worldwide Search handler
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchWorldwideLocations(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item: GeocodingResult) => {
    setLocation({
      name: item.name,
      state: item.state,
      country: item.country,
      lat: item.lat,
      lng: item.lng,
      zoom: 15,
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  // Square drawing logic: drops ~150m square around clicked point
  const handleSquarePlaced = (clickedCenter: [number, number]) => {
    const latDelta = 0.0012;
    const lngDelta = 0.0015;
    const [cLat, cLng] = clickedCenter;

    const squareCoords: [number, number][] = [
      [cLat + latDelta, cLng - lngDelta],
      [cLat + latDelta, cLng + lngDelta],
      [cLat - latDelta, cLng + lngDelta],
      [cLat - latDelta, cLng - lngDelta],
    ];

    const acres = calculatePolygonAcreage(squareCoords);
    setPendingCoords(squareCoords);
    setPendingAcres(acres);
    setModalOpen(true);
    setDrawingMode('inspect');
  };

  // Rectangle drawing logic: requires 2 corner points
  const handleRectangleCorner = (pt: [number, number]) => {
    if (activeDrawPoints.length === 0) {
      setActiveDrawPoints([pt]);
    } else {
      const p1 = activeDrawPoints[0];
      const p2 = pt;

      const minLat = Math.min(p1[0], p2[0]);
      const maxLat = Math.max(p1[0], p2[0]);
      const minLng = Math.min(p1[1], p2[1]);
      const maxLng = Math.max(p1[1], p2[1]);

      const rectCoords: [number, number][] = [
        [maxLat, minLng],
        [maxLat, maxLng],
        [minLat, maxLng],
        [minLat, minLng],
      ];

      const acres = calculatePolygonAcreage(rectCoords);
      setPendingCoords(rectCoords);
      setPendingAcres(acres);
      setActiveDrawPoints([]);
      setModalOpen(true);
      setDrawingMode('inspect');
    }
  };

  // Click on existing polygon
  const handlePolygonClick = (field: FieldItem) => {
    if (drawingMode === 'delete') {
      removeField(field.id);
    } else {
      selectField(field.id);
    }
  };

  return (
    <div
      className={`relative flex flex-col w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-cyan-500/25 bg-slate-900 ${
        drawingMode !== 'inspect' ? 'cursor-crosshair' : ''
      }`}
      style={{ height }}
    >
      {/* Top Search & Controls HUD */}
      <div className="absolute top-3 left-3 right-14 z-[400] flex flex-col gap-2 pointer-events-auto">
        <div className="flex flex-wrap items-center gap-2">
          {/* Worldwide Geocoding Search Bar */}
          <div className="relative flex items-center bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md rounded-2xl border border-white/20 dark:border-cyan-500/30 shadow-xl px-3 py-1.5 min-w-[220px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
            <form onSubmit={handleSearch} className="flex-1 flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search worldwide (village, city, pin)..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-400 outline-none font-medium"
              />
              <button
                type="submit"
                onClick={handleSearch}
                className="ml-1 text-[10px] font-bold text-emerald-400 dark:text-cyan-400 hover:text-emerald-300 px-1.5 py-0.5 rounded-md hover:bg-white/10 transition cursor-pointer"
              >
                Go
              </button>
            </form>
            {isSearching && (
              <div className="w-3 h-3 border-2 border-emerald-400 dark:border-cyan-400 border-t-transparent rounded-full animate-spin ml-1 flex-shrink-0" />
            )}

            {/* Worldwide Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md rounded-2xl border border-white/20 dark:border-cyan-500/30 shadow-2xl overflow-hidden z-50 text-xs text-white max-h-56 overflow-y-auto divide-y divide-white/5">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-600/50 dark:hover:bg-cyan-600/40 text-slate-200 hover:text-white transition-colors block"
                  >
                    <div className="flex items-center gap-1.5 font-bold truncate text-white">
                      <MapPin className="w-3 h-3 text-emerald-400 dark:text-cyan-400 flex-shrink-0" />
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate pl-4.5">
                      {item.display_name}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current Location Badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 dark:border-cyan-500/30 shadow-xl text-white text-xs font-bold">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 dark:text-cyan-400 flex-shrink-0" />
            <span className="truncate max-w-[160px]">{currentLocation.name}</span>
            {currentLocation.state && (
              <span className="text-slate-400 font-normal">({currentLocation.state})</span>
            )}
          </div>

          {/* Telemetry Indicator */}
          {!isCompact && (
            <div className="hidden lg:flex items-center gap-3 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20 dark:border-cyan-500/30 shadow-xl text-white text-xs">
              <div className="flex items-center gap-1 text-emerald-300 dark:text-emerald-400 font-semibold">
                <CloudSun className="w-3.5 h-3.5" />
                <span>{telemetry?.current?.temperature_c ?? 28.4}°C</span>
              </div>
              <span className="text-white/30">|</span>
              <div className="flex items-center gap-1 text-blue-300 dark:text-cyan-400 font-semibold">
                <Droplets className="w-3.5 h-3.5" />
                <span>ETo: {telemetry?.fao56_water_demand?.daily_crop_water_demand_mm ?? 5.18} mm/d</span>
              </div>
              <span className="text-white/30">|</span>
              <div className="flex items-center gap-1 text-amber-300 dark:text-amber-400 font-semibold">
                <Gauge className="w-3.5 h-3.5" />
                <span>pH {telemetry?.soil_properties?.soil_ph ?? 6.45}</span>
              </div>
            </div>
          )}
        </div>

        {/* Floating Interactive Drawing Toolbar */}
        <DrawingControls />
      </div>

      {/* Leaflet Map Engine */}
      <MapContainer
        center={center}
        zoom={currentLocation.zoom || 15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <MapController center={center} zoom={currentLocation.zoom || 15} />
        <MapDrawingHandler
          onSquarePlaced={handleSquarePlaced}
          onRectangleCorner={handleRectangleCorner}
        />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="🛰️ Esri World Imagery">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri &mdash; Maxar, Earthstar Geographics"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🌿 NDVI Vegetation Heatmap">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri &mdash; Multispectral NDVI Simulation"
              className="hue-rotate-60 saturate-200 contrast-150"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🗺️ OpenStreetMap">
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="🌾 Dynamic Field Parcels">
            <>
              {fields.map((field) => {
                const isSelected = selectedFieldId === field.id || selectedFieldId === field.name;
                const color = getFieldColor(field, isNight);
                const isWarning = field.healthStatus === 'Below Optimal' || field.moisturePercent < 22;

                const polygonClassName = isSelected
                  ? 'leaflet-polygon-selected'
                  : isWarning
                  ? 'polygon-warning'
                  : 'polygon-healthy';

                return (
                  <Polygon
                    key={field.id}
                    positions={field.polygonCoords}
                    pathOptions={{
                      color: isSelected ? '#00f2fe' : color,
                      fillColor: color,
                      fillOpacity: isSelected ? (isNight ? 0.75 : 0.65) : isNight ? 0.5 : 0.4,
                      weight: isSelected ? 4 : isNight ? 2.5 : 2,
                      dashArray: isSelected ? undefined : isNight ? undefined : '4 2',
                      className: polygonClassName,
                    }}
                    eventHandlers={{
                      click: () => handlePolygonClick(field),
                    }}
                  >
                    <Popup>
                      <div
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          minWidth: 220,
                          padding: 2,
                          background: isNight ? '#0b1329' : '#ffffff',
                          color: isNight ? '#f8fafc' : '#0f172a',
                          borderRadius: 12,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: color,
                              boxShadow: isNight ? `0 0 8px ${color}` : undefined,
                            }}
                          />
                          <strong
                            style={{
                              fontSize: 13,
                              color: isNight ? '#ffffff' : '#0f172a',
                            }}
                          >
                            {field.name}
                          </strong>
                          <span
                            style={{
                              marginLeft: 'auto',
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 99,
                              background: color + '22',
                              color: color,
                              border: isNight ? `1px solid ${color}66` : undefined,
                            }}
                          >
                            {field.healthStatus}
                          </span>
                        </div>

                        <table
                          style={{
                            fontSize: 11,
                            width: '100%',
                            borderCollapse: 'collapse',
                            marginBottom: 8,
                          }}
                        >
                          <tbody>
                            {[
                              ['🌱 Crop', field.cropType],
                              ['📐 Area', `${field.areaAcres} Acres`],
                              ['💧 Soil Moisture', `${field.moisturePercent}%`],
                              ['🧪 Soil pH', `${field.soilPh}`],
                              ['🌿 NDVI Score', `${field.ndviScore}`],
                              [
                                '🌾 Est. Yield',
                                `${field.predictedYieldTonnesPerHa || 45.2} t/ha`,
                              ],
                            ].map(([k, v]) => (
                              <tr key={k}>
                                <td
                                  style={{
                                    padding: '3px 0',
                                    color: isNight ? '#94a3b8' : '#64748b',
                                  }}
                                >
                                  {k}
                                </td>
                                <td
                                  style={{
                                    padding: '3px 0',
                                    fontWeight: 700,
                                    color: isNight ? '#00f2fe' : '#0f172a',
                                    textAlign: 'right',
                                  }}
                                >
                                  {v}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            onClick={() => selectField(field.id)}
                            style={{
                              flex: 1,
                              padding: '6px 0',
                              background: isNight ? '#0284c7' : '#059669',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: isNight
                                ? '0 0 10px rgba(6, 182, 212, 0.4)'
                                : undefined,
                            }}
                          >
                            Select Active
                          </button>
                          <button
                            onClick={() => removeField(field.id)}
                            style={{
                              padding: '6px 8px',
                              background: isNight ? '#4c0519' : '#fee2e2',
                              color: isNight ? '#fda4af' : '#ef4444',
                              border: 'none',
                              borderRadius: 8,
                              cursor: 'pointer',
                            }}
                            title="Delete Field"
                          >
                            <Trash2 style={{ width: 13, height: 13 }} />
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Polygon>
                );
              })}
            </>
          </LayersControl.Overlay>
        </LayersControl>

        {/* Live Drawing Preview for Rectangle Mode */}
        {drawingMode === 'rectangle' && activeDrawPoints.length === 1 && (
          <Polyline
            positions={[activeDrawPoints[0], activeDrawPoints[0]]}
            pathOptions={{ color: '#00f2fe', weight: 3, dashArray: '6 4' }}
          />
        )}
      </MapContainer>

      {/* Floating Bottom Action Bar */}
      <div className="absolute bottom-3 left-3 z-[400] flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 dark:border-cyan-500/30 shadow-lg text-white text-[11px] font-semibold">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 dark:text-cyan-400" />
          <span>{fields.length} Parcels Configured</span>
        </div>

        {onOpenOptimizer && (
          <button
            onClick={onOpenOptimizer}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md transition-all hover:scale-105 cursor-pointer ${
              isNight
                ? 'neon-btn-cyber'
                : 'bg-emerald-600/90 hover:bg-emerald-600 text-white border border-emerald-400/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200 dark:text-cyan-200" />
            STCR Fertilizer
          </button>
        )}

        {onOpenWaterLogger && (
          <button
            onClick={onOpenWaterLogger}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg backdrop-blur-md border border-blue-400/30 dark:border-cyan-400/50 dark:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all hover:scale-105 cursor-pointer"
          >
            <Droplets className="w-3.5 h-3.5 text-blue-200 dark:text-cyan-200" />
            Water & Pump Audit
          </button>
        )}
      </div>

      {/* Save Custom Parcel Modal */}
      <CreateFieldModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        polygonCoords={pendingCoords}
        calculatedAcres={pendingAcres}
        onSave={(newField) => addField(newField)}
      />
    </div>
  );
}
