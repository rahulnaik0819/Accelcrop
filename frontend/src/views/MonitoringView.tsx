import { useState } from 'react';
import type { SensorReadings, FieldActivity } from '../services/api';
import SatelliteFieldMap from '../components/SatelliteFieldMap';
import StatusStrip from '../components/StatusStrip';
import { Droplets, FlaskConical, Leaf, AlertTriangle, Crosshair, Satellite, Thermometer, Sparkles, Clock, Plus, Trash2 } from 'lucide-react';
import { useFarm, type FieldItem } from '../context/FarmContext';

interface MonitoringViewProps {
  sensors: SensorReadings;
  activities: FieldActivity[];
  selectedField: string;
  onSelectField: (id: string) => void;
  onOpenOptimizer?: () => void;
  onOpenWaterLogger?: () => void;
}

export default function MonitoringView({
  sensors,
  activities,
  onOpenOptimizer,
  onOpenWaterLogger,
}: MonitoringViewProps) {
  const [mapMode, setMapMode] = useState<'satellite' | 'drone'>('satellite');
  const { farmLocation, fields, selectedFieldId, selectedField, selectField, removeField, setDrawingMode, drawingMode } = useFarm();

  const activeField = selectedField || fields[0];

  const [editingField, setEditingField] = useState<FieldItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCrop, setEditCrop] = useState('Wheat');
  const [editMoisture, setEditMoisture] = useState<number>(21.4);
  const [editPh, setEditPh] = useState<number>(6.4);
  const { updateField } = useFarm();

  const handleOpenEdit = (field: FieldItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingField(field);
    setEditName(field.name);
    setEditCrop(field.cropType);
    setEditMoisture(field.moisturePercent);
    setEditPh(field.soilPh);
  };

  const handleSaveEdit = () => {
    if (editingField) {
      updateField(editingField.id, {
        name: editName,
        cropType: editCrop,
        moisturePercent: editMoisture,
        soilPh: editPh,
        healthStatus: editMoisture < 16 ? 'Critical' : editMoisture < 22 ? 'Below Optimal' : 'Optimal',
      });
      setEditingField(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full fade-up">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">Field Monitoring & Telemetry</h1>
          <p className="text-xs text-slate-400 dark:text-slate-400">
            {farmLocation.name} ({farmLocation.state}) · {fields.reduce((acc, f) => acc + f.areaAcres, 0).toFixed(1)} Acres · {fields.length} Active Parcels
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {drawingMode === 'inspect' && (
            <button
              onClick={() => setDrawingMode('square')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + Draw Parcel
            </button>
          )}

          {onOpenOptimizer && (
            <button
              onClick={onOpenOptimizer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              STCR Fertilizer
            </button>
          )}

          {onOpenWaterLogger && (
            <button
              onClick={onOpenWaterLogger}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Water & Pump Log
            </button>
          )}

          <div className="flex bg-slate-100 p-0.5 rounded-full">
            {(['satellite', 'drone'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setMapMode(mode)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  mapMode === mode ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode === 'satellite' ? <Satellite className="w-3.5 h-3.5" /> : <Crosshair className="w-3.5 h-3.5" />}
                {mode === 'satellite' ? 'Satellite' : 'Drone Reticle'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Map — 8 cols */}
        <div className="col-span-12 lg:col-span-8">
          {mapMode === 'satellite' ? (
            <div className="card overflow-hidden" style={{ height: 520 }}>
              <SatelliteFieldMap
                height="520px"
                onOpenOptimizer={onOpenOptimizer}
                onOpenWaterLogger={onOpenWaterLogger}
              />
            </div>
          ) : (
            /* Drone mode */
            <div className="card overflow-hidden relative" style={{ height: 520, background: '#0c1a14' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-slate-900 to-emerald-900/60 rounded-2xl" />
              <div className="scan-line absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-70 pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-44 h-44">
                  <div className="reticle-spin absolute inset-0 border-2 border-emerald-500/30 rounded-full" />
                  <div className="absolute inset-6 border border-emerald-400/50 rounded-full" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-400/40" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-400/40" />
                  <Crosshair className="absolute inset-0 m-auto w-6 h-6 text-emerald-400" />
                  {[
                    ['top-0 left-0', 'border-t-2 border-l-2'],
                    ['top-0 right-0', 'border-t-2 border-r-2'],
                    ['bottom-0 left-0', 'border-b-2 border-l-2'],
                    ['bottom-0 right-0', 'border-b-2 border-r-2'],
                  ].map(([pos, cls], i) => (
                    <div key={i} className={`absolute ${pos} w-5 h-5 border-emerald-400 ${cls}`} />
                  ))}
                </div>
              </div>
              {/* HUD left */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {[
                  ['SOIL pH', activeField?.soilPh || sensors.soil_ph],
                  ['MOISTURE', `${activeField?.moisturePercent || sensors.soil_moisture_pct}%`],
                  ['TEMPERATURE', `${sensors.temperature_c}°C`],
                ].map(([label, val]) => (
                  <div key={label as string} className="glass rounded-lg px-3 py-2">
                    <p className="text-[9px] text-emerald-300 font-semibold tracking-widest">{label as string}</p>
                    <p className="text-sm font-bold text-white">{val as string | number}</p>
                  </div>
                ))}
              </div>
              {/* Drone badge */}
              <div className="absolute bottom-4 right-4 glass rounded-xl px-3 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                <span className="text-[10px] text-white font-semibold">DRONE ACTIVE · {activeField?.name}</span>
              </div>
              {/* Target field label */}
              <div className="absolute top-4 right-4 glass rounded-xl px-3 py-2">
                <p className="text-[10px] text-emerald-300 font-semibold">TARGET</p>
                <p className="text-sm font-bold text-white">{activeField?.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right panel — 4 cols Dynamic Fields List */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          {/* Dynamic Field list with quick delete & details */}
          <div className="card p-4 flex flex-col max-h-[340px]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Farm Parcels ({fields.length})
              </p>
              <button
                onClick={() => setDrawingMode('square')}
                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto pr-1">
              {fields.map((f) => {
                const isActive = selectedFieldId === f.id || selectedFieldId === f.name;
                const statusColor =
                  f.healthStatus === 'Optimal'
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                    : f.healthStatus === 'Below Optimal'
                    ? 'text-amber-600 bg-amber-50 border-amber-200'
                    : 'text-red-600 bg-red-50 border-red-200';
                return (
                  <div
                    key={f.id}
                    onClick={() => selectField(f.id)}
                    className={`group flex flex-col p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isActive ? 'border-emerald-500 bg-emerald-50/80 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Leaf className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isActive ? 'text-emerald-900' : 'text-slate-700'}`}>
                            {f.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {f.cropType} · {f.areaAcres} Ac · NDVI {f.ndviScore}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
                          {f.healthStatus}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(f, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-emerald-600 rounded-md transition cursor-pointer text-[10px] font-bold"
                          title="Edit parcel"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeField(f.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded-md transition cursor-pointer"
                          title="Delete parcel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Moisture Progress Bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[9px] text-slate-400 font-mono">Moisture:</span>
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            f.moisturePercent < 16 ? 'bg-red-500' : f.moisturePercent < 22 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(f.moisturePercent * 3, 100)}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-600">{f.moisturePercent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Telemetry inspector for active field */}
          <div className="card p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Telemetry Inspector · {activeField?.name}
              </p>
              {activeField?.healthStatus !== 'Optimal' && (
                <span className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold">
                  <AlertTriangle className="w-3 h-3" /> Alert
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Droplets, label: 'Soil Moisture', value: `${activeField?.moisturePercent || 21.4}%`, color: 'text-blue-600 bg-blue-50' },
                { icon: FlaskConical, label: 'Soil pH', value: `${activeField?.soilPh || 6.4}`, color: 'text-purple-600 bg-purple-50' },
                { icon: Leaf, label: 'NDVI Vitality', value: `${activeField?.ndviScore || 0.82}`, color: 'text-emerald-600 bg-emerald-50' },
                { icon: Thermometer, label: 'Temperature', value: `${sensors.temperature_c}°C`, color: 'text-orange-600 bg-orange-50' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className={`rounded-xl p-3 ${color.split(' ')[1]}`}>
                  <Icon className={`w-4 h-4 ${color.split(' ')[0]} mb-1`} />
                  <p className="text-[10px] text-slate-400">{label}</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status strip */}
        <div className="col-span-12">
          <StatusStrip activities={activities} />
        </div>
      </div>

      {/* Quick Edit Parcel Modal */}
      {editingField && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Edit Parcel: {editingField.name}</h3>
              <button
                onClick={() => setEditingField(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Field Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Crop Type</label>
                <select
                  value={editCrop}
                  onChange={(e) => setEditCrop(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Mustard', 'Soybean'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Moisture (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editMoisture}
                    onChange={(e) => setEditMoisture(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Soil pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editPh}
                    onChange={(e) => setEditPh(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingField(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
