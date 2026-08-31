import { useState } from 'react';
import { X, Check, Sprout, Calendar, TrendingUp } from 'lucide-react';
import type { FieldItem } from '../context/FarmContext';

interface CreateFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  polygonCoords: [number, number][];
  calculatedAcres: number;
  onSave: (fieldData: Omit<FieldItem, 'id'>) => void;
}

const CROP_OPTIONS = [
  'Wheat',
  'Rice',
  'Maize',
  'Cotton',
  'Sugarcane',
  'Mustard',
  'Soybean',
  'Grapes',
  'Vegetables',
];

export default function CreateFieldModal({
  isOpen,
  onClose,
  polygonCoords,
  calculatedAcres,
  onSave,
}: CreateFieldModalProps) {
  const [name, setName] = useState('');
  const [cropType, setCropType] = useState('Wheat');
  const [targetYield, setTargetYield] = useState('48.0');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-assign realistic simulated agronomic telemetry
    const moisture = Math.round((22 + Math.random() * 11) * 10) / 10; // 22% - 33%
    const ph = Math.round((6.2 + Math.random() * 0.9) * 10) / 10; // 6.2 - 7.1
    const ndvi = Math.round((0.72 + Math.random() * 0.18) * 100) / 100; // 0.72 - 0.90
    const targetY = parseFloat(targetYield) || 45.0;
    const predictedY = Math.round((targetY * (0.92 + Math.random() * 0.12)) * 10) / 10;
    const totalProd = Math.round(calculatedAcres * 0.404686 * predictedY * 10) / 10;

    const healthStatus: 'Optimal' | 'Below Optimal' | 'Critical' =
      moisture < 16 || ph < 5.8 ? 'Critical' : moisture < 22 ? 'Below Optimal' : 'Optimal';

    onSave({
      name: name.trim() || `Field Parcel (${cropType})`,
      polygonCoords,
      areaAcres: calculatedAcres,
      cropType,
      moisturePercent: moisture,
      soilPh: ph,
      ndviScore: ndvi,
      healthStatus,
      targetYieldTonnesPerHa: targetY,
      predictedYieldTonnesPerHa: predictedY,
      totalProductionTonnes: totalProd,
      sowingDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Save Farm Parcel</h3>
              <p className="text-xs text-slate-400 dark:text-slate-400">Add new parcel to global farm index</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Calculated acreage highlight */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
              Computed Parcel Area:
            </span>
            <span className="text-base font-bold text-emerald-950 dark:text-emerald-200">
              {calculatedAcres} Acres <span className="text-xs font-normal opacity-70">({(calculatedAcres * 0.404686).toFixed(2)} Ha)</span>
            </span>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Parcel Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Field 05 (North Basin)"
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Crop Variety
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
              >
                {CROP_OPTIONS.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" /> Target (t/ha)
              </label>
              <input
                type="number"
                step="0.5"
                value={targetYield}
                onChange={(e) => setTargetYield(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-500" /> Sowing Date
            </label>
            <input
              type="date"
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Save Field Parcel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
