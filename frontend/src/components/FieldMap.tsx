import { useState } from 'react';
import { Leaf, Crosshair, Satellite, Plus } from 'lucide-react';
import SatelliteFieldMap from './SatelliteFieldMap';
import { useFarm } from '../context/FarmContext';

interface FieldMapProps {
  onOpenOptimizer?: () => void;
  onOpenWaterLogger?: () => void;
}

function DroneScannerHUD({
  soilPh,
  moisture,
  fieldName,
}: {
  soilPh: number;
  moisture: number;
  fieldName: string;
}) {
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden bg-slate-900 z-10">
      {/* Thermal overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-slate-900 to-emerald-900/60" />

      {/* Scan line animation */}
      <div className="scan-line absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none opacity-70" />

      {/* Reticle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-36 h-36">
          <div className="reticle-spin absolute inset-0 border-2 border-emerald-500/30 rounded-full" />
          <div className="absolute inset-4 border border-emerald-400/50 rounded-full" />
          {/* Cross-hairs */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-400/40" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-400/40" />
          <Crosshair className="absolute inset-0 m-auto w-6 h-6 text-emerald-400" />
          {/* Corner brackets */}
          {[
            ['top-0 left-0', 'border-t-2 border-l-2'],
            ['top-0 right-0', 'border-t-2 border-r-2'],
            ['bottom-0 left-0', 'border-b-2 border-l-2'],
            ['bottom-0 right-0', 'border-b-2 border-r-2'],
          ].map(([pos, cls], i) => (
            <div key={i} className={`absolute ${pos} w-4 h-4 border-emerald-400 ${cls}`} />
          ))}
        </div>
      </div>

      {/* HUD stats */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
        {[
          { label: 'Target', value: fieldName, unit: '' },
          { label: 'Soil pH', value: soilPh, unit: '' },
          { label: 'Leaf Moisture', value: `${moisture}%`, unit: '' },
          { label: 'NDVI Score', value: '0.85', unit: '' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-lg px-2.5 py-1.5">
            <p className="text-[9px] text-emerald-300 font-semibold tracking-wider uppercase">{s.label}</p>
            <p className="text-sm font-bold text-white">
              {s.value}
              {s.unit}
            </p>
          </div>
        ))}
      </div>

      {/* Drone badge */}
      <div className="absolute bottom-3 right-3 glass rounded-xl px-3 py-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
        <span className="text-[10px] text-white font-semibold">DRONE SCANNER ACTIVE</span>
      </div>
    </div>
  );
}

export default function FieldMap({ onOpenOptimizer, onOpenWaterLogger }: FieldMapProps) {
  const [droneMode, setDroneMode] = useState(false);
  const { fields, selectedFieldId, selectedField, selectField, setDrawingMode, drawingMode } = useFarm();

  const activeField = selectedField || fields[0];

  return (
    <div className="card p-4 h-full flex flex-col gap-3">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            {droneMode ? 'Drone Crop Scanner' : 'Satellite Field View'}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {fields.reduce((acc, f) => acc + f.areaAcres, 0).toFixed(1)} Acres · {fields.length} Active Farm Parcels · Real-Time Satellite NDVI
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!droneMode && drawingMode === 'inspect' && (
            <button
              onClick={() => setDrawingMode('square')}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Draw Parcel
            </button>
          )}

          {/* Toggle */}
          <button
            id="field-map-toggle"
            onClick={() => setDroneMode(!droneMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-300 cursor-pointer ${
              droneMode
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {droneMode ? <Crosshair className="w-3.5 h-3.5" /> : <Satellite className="w-3.5 h-3.5" />}
            {droneMode ? 'Drone Mode' : 'Satellite Mode'}
          </button>
        </div>
      </div>

      {/* Map container */}
      <div className="relative flex-1 min-h-[300px] rounded-2xl overflow-hidden">
        {droneMode ? (
          <DroneScannerHUD
            soilPh={activeField?.soilPh || 6.4}
            moisture={activeField?.moisturePercent || 21.4}
            fieldName={activeField?.name || 'Field 01'}
          />
        ) : (
          <SatelliteFieldMap
            height="320px"
            isCompact={true}
            onOpenOptimizer={onOpenOptimizer}
            onOpenWaterLogger={onOpenWaterLogger}
          />
        )}
      </div>

      {/* Dynamic Field selector tabs */}
      {!droneMode && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pt-1">
          {fields.map((f) => {
            const isActive = selectedFieldId === f.id || selectedFieldId === f.name;
            return (
              <button
                key={f.id}
                id={`field-tab-${f.id.toLowerCase().replace(' ', '-')}`}
                onClick={() => selectField(f.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Leaf className="w-3 h-3" />
                <span>{f.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-emerald-700 text-emerald-100'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  NDVI {f.ndviScore}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setDrawingMode('square')}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-dashed border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            Add Parcel
          </button>
        </div>
      )}
    </div>
  );
}
