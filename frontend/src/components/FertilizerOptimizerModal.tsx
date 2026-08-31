import { useState, useEffect } from 'react';
import { X, Sparkles, Sprout, DollarSign, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api, type FertilizerOptimizeResponse, MOCK_FERTILIZER_OPTIMIZE } from '../services/api';

interface FertilizerOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCrop?: string;
  initialArea?: number;
  initialSoilPh?: number;
  onApplyToSchedule?: (activity: string) => void;
}

export default function FertilizerOptimizerModal({
  isOpen,
  onClose,
  initialCrop = 'Wheat',
  initialArea = 128,
  initialSoilPh = 6.4,
  onApplyToSchedule,
}: FertilizerOptimizerModalProps) {
  const [crop, setCrop] = useState(initialCrop);
  const [targetYield, setTargetYield] = useState(5.5);
  const [areaAcres, setAreaAcres] = useState(initialArea);
  const [soilPh, setSoilPh] = useState(initialSoilPh);
  const [soilNitrogen, setSoilNitrogen] = useState(240);
  const [applied, setApplied] = useState(false);
  const [result, setResult] = useState<FertilizerOptimizeResponse>(MOCK_FERTILIZER_OPTIMIZE);

  const calculate = async () => {
    try {
      const data = await api.optimizeFertilizer({
        crop,
        target_yield_t_ha: targetYield,
        area_acres: areaAcres,
        soil_ph: soilPh,
        soil_nitrogen_kg_ha: soilNitrogen,
      });
      setResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      calculate();
    }
  }, [isOpen, crop, targetYield, areaAcres, soilPh, soilNitrogen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Target Yield & STCR Fertilizer Optimizer</h2>
              <p className="text-xs text-emerald-300/80">ICAR Soil Test Crop Response Targeted Yield Equation Engine</p>
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
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Target Crop</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Mustard', 'Soybean'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Target Yield ({targetYield} t/ha)
              </label>
              <input
                type="range"
                min={2.0}
                max={12.0}
                step={0.5}
                value={targetYield}
                onChange={(e) => setTargetYield(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 mt-2"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Farm Area (Acres)</label>
              <input
                type="number"
                value={areaAcres}
                onChange={(e) => setAreaAcres(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Soil pH</label>
              <input
                type="number"
                step="0.1"
                min="4.5"
                max="9.0"
                value={soilPh}
                onChange={(e) => setSoilPh(parseFloat(e.target.value) || 6.4)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Soil Available N (kg/ha)</label>
              <input
                type="number"
                value={soilNitrogen}
                onChange={(e) => setSoilNitrogen(parseFloat(e.target.value) || 240)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Urea Card */}
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-800">Urea (46% N)</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-600 text-white rounded-full font-bold">Nitrogen</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-950">
                  {result.fertilizer_recommendation.urea_bags_50kg}
                </span>
                <span className="text-sm font-semibold text-emerald-700">bags (50 kg)</span>
              </div>
              <p className="text-[11px] text-emerald-700/80 mt-1">
                Total: {result.fertilizer_recommendation.urea_total_kg.toLocaleString()} kg pure Urea
              </p>
            </div>

            {/* DAP Card */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/60 border border-blue-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-800">DAP (18% N, 46% P₂O₅)</span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-600 text-white rounded-full font-bold">Phosphorus</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-950">
                  {result.fertilizer_recommendation.dap_bags_50kg}
                </span>
                <span className="text-sm font-semibold text-blue-700">bags (50 kg)</span>
              </div>
              <p className="text-[11px] text-blue-700/80 mt-1">
                Total: {result.fertilizer_recommendation.dap_total_kg.toLocaleString()} kg DAP
              </p>
            </div>

            {/* MOP Card */}
            <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-800">MOP (60% K₂O)</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-600 text-white rounded-full font-bold">Potassium</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-950">
                  {result.fertilizer_recommendation.mop_bags_50kg}
                </span>
                <span className="text-sm font-semibold text-amber-700">bags (50 kg)</span>
              </div>
              <p className="text-[11px] text-amber-700/80 mt-1">
                Total: {result.fertilizer_recommendation.mop_total_kg.toLocaleString()} kg MOP
              </p>
            </div>
          </div>

          {/* Financial & Environmental Benefits Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">STCR Cost Optimization vs Blanket Dose</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-lg font-bold text-emerald-400">
                    ₹{result.financial_optimization.estimated_savings_inr.toLocaleString()} Saved
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    ₹{result.financial_optimization.blanket_cost_inr.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    ➔ ₹{result.financial_optimization.stcr_cost_inr.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-700 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Zero Runoff Eco-Guarantee</p>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  {result.financial_optimization.environmental_benefit}
                </p>
              </div>
            </div>
          </div>

          {/* Application Schedule Timeline */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              3-Stage Split Application Protocol
            </h3>
            <div className="space-y-3">
              {result.application_schedule.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{item.stage}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full font-semibold">
                        {item.timing}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 pl-7">{item.notes}</p>
                  </div>

                  <div className="flex items-center gap-2 pl-7 md:pl-0 flex-wrap">
                    {item.dap_bags > 0 && (
                      <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg border border-blue-200">
                        {item.dap_bags} bags DAP
                      </span>
                    )}
                    {item.urea_bags > 0 && (
                      <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200">
                        {item.urea_bags} bags Urea
                      </span>
                    )}
                    {item.mop_bags > 0 && (
                      <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg border border-amber-200">
                        {item.mop_bags} bags MOP
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <div className="text-[11px] text-slate-500">
            STCR Equation: <span className="font-mono text-slate-700">{result.stcr_equation}</span>
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
                onApplyToSchedule?.('Optimize Fertilizer Dosage');
                setApplied(true);
                setTimeout(() => {
                  setApplied(false);
                  onClose();
                }, 1200);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              {applied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Scheduled in Activities!
                </>
              ) : (
                <>
                  <Sprout className="w-4 h-4" />
                  Apply Schedule to Farm
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
