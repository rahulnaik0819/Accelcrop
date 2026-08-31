import { useState, useEffect } from 'react';
import { X, Droplets, Users, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { api, type WaterLaborAuditResponse, MOCK_WATER_LABOR_AUDIT } from '../services/api';

interface WaterPumpLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialArea?: number;
  onApplyActivity?: (activity: string) => void;
}

export default function WaterPumpLoggerModal({
  isOpen,
  onClose,
  initialArea = 128,
  onApplyActivity,
}: WaterPumpLoggerModalProps) {
  const [pumpHp, setPumpHp] = useState(5.0);
  const [runtimeHours, setRuntimeHours] = useState(4.5);
  const [areaAcres, setAreaAcres] = useState(initialArea);
  const [assignedWorkers, setAssignedWorkers] = useState(4);
  const workerHours = 8.0;
  const [activity, setActivity] = useState('weeding');
  const [auditResult, setAuditResult] = useState<WaterLaborAuditResponse>(MOCK_WATER_LABOR_AUDIT);
  const [applied, setApplied] = useState(false);

  const calculate = async () => {
    try {
      const data = await api.auditWaterLabor({
        pump_hp: pumpHp,
        pump_runtime_hours: runtimeHours,
        cultivated_area_acres: areaAcres,
        assigned_workers: assignedWorkers,
        worker_hours_per_day: workerHours,
        activity: activity,
      });
      setAuditResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      calculate();
    }
  }, [isOpen, pumpHp, runtimeHours, areaAcres, assignedWorkers, workerHours, activity]);

  if (!isOpen) return null;

  const { water_audit, labor_audit } = auditResult;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Water & Labor Resource Audit</h2>
              <p className="text-xs text-blue-300/80">Pump Run-Time Logger & ICAR Agricultural Labor Benchmark Audit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Pump Power ({pumpHp} HP)
              </label>
              <select
                value={pumpHp}
                onChange={(e) => setPumpHp(parseFloat(e.target.value))}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={3.0}>3.0 HP (Submersible / ~270 LPM)</option>
                <option value={5.0}>5.0 HP (Standard / ~450 LPM)</option>
                <option value={7.5}>7.5 HP (High Flow / ~675 LPM)</option>
                <option value={10.0}>10.0 HP (Heavy Borewell / ~900 LPM)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Runtime: {runtimeHours} hrs/day
              </label>
              <input
                type="range"
                min={0.5}
                max={12.0}
                step={0.5}
                value={runtimeHours}
                onChange={(e) => setRuntimeHours(parseFloat(e.target.value))}
                className="w-full accent-blue-600 mt-2"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Area (Acres)</label>
              <input
                type="number"
                min={1}
                value={areaAcres}
                onChange={(e) => setAreaAcres(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Workers ({assignedWorkers} assigned)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={assignedWorkers}
                onChange={(e) => setAssignedWorkers(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Field Activity</label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none capitalize"
              >
                <option value="weeding">Weeding (8 hrs/acre)</option>
                <option value="land_preparation">Land Prep (6 hrs/acre)</option>
                <option value="irrigation">Irrigation (3 hrs/acre)</option>
                <option value="harvesting">Harvesting (12 hrs/acre)</option>
              </select>
            </div>
          </div>

          {/* Water & Labor Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Water Audit Box */}
            <div className={`p-5 rounded-2xl border ${water_audit.threshold_exceeded ? 'bg-red-50/70 border-red-200' : 'bg-blue-50/70 border-blue-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Droplets className={`w-5 h-5 ${water_audit.threshold_exceeded ? 'text-red-600' : 'text-blue-600'}`} />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Water Consumption Audit</h3>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${water_audit.threshold_exceeded ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                  {water_audit.threshold_exceeded ? 'Above Threshold (74%)' : 'Optimal'}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Usage vs Seasonal Allocation</span>
                    <span className="font-bold">{water_audit.water_usage_pct}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${water_audit.threshold_exceeded ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(100, water_audit.water_usage_pct)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                    <p className="text-[10px] text-slate-500">Total Pumped</p>
                    <p className="text-sm font-bold text-slate-900">{water_audit.total_water_pumped_liters.toLocaleString()} L</p>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                    <p className="text-[10px] text-slate-500">Crop Demand Target</p>
                    <p className="text-sm font-bold text-slate-900">{water_audit.standard_demand_liters.toLocaleString()} L</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 italic">
                  {water_audit.recommendation}
                </p>
              </div>
            </div>

            {/* Labor Audit Box */}
            <div className={`p-5 rounded-2xl border ${labor_audit.labor_shortage_hours > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-emerald-50/70 border-emerald-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className={`w-5 h-5 ${labor_audit.labor_shortage_hours > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Labor Balance Audit</h3>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${labor_audit.labor_shortage_hours > 0 ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}`}>
                  {labor_audit.labor_shortage_hours > 0 ? 'Bottleneck' : 'Adequate'}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Labor Coverage ({labor_audit.activity})</span>
                    <span className="font-bold">{labor_audit.labor_efficiency_pct}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${labor_audit.labor_shortage_hours > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, labor_audit.labor_efficiency_pct)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                    <p className="text-[10px] text-slate-500">Hours Required</p>
                    <p className="text-sm font-bold text-slate-900">{labor_audit.required_labor_hours} hrs</p>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                    <p className="text-[10px] text-slate-500">Hours Available</p>
                    <p className="text-sm font-bold text-slate-900">{labor_audit.available_labor_hours} hrs</p>
                  </div>
                </div>

                {labor_audit.warning && (
                  <div className="flex items-start gap-2 p-2.5 bg-amber-100/70 text-amber-900 rounded-xl text-[11px]">
                    <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <span>{labor_audit.warning}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <div className="text-[11px] text-slate-500">
            5 HP standard flow: <span className="font-semibold text-slate-700">450 Litres/Minute</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onApplyActivity?.('Micro-Irrigation');
                setApplied(true);
                setTimeout(() => {
                  setApplied(false);
                  onClose();
                }, 1200);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              {applied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Logged in Farm Tasks!
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  Log Irrigation Schedule
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
