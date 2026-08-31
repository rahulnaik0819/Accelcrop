import { Sparkles, Bot, ArrowRight } from 'lucide-react';
import type { FieldItem } from '../context/FarmContext';
import { useTheme } from '../context/ThemeContext';

interface AIInsightProps {
  onOpenDrawer: () => void;
  selectedField?: FieldItem;
}

export default function AIInsight({ onOpenDrawer, selectedField }: AIInsightProps) {
  const { isNight } = useTheme();

  const getFieldInsight = () => {
    if (!selectedField) {
      return 'Farm parcels are operating within normal seasonal parameters. Soil moisture and NDVI indices are synchronized with satellite telemetry.';
    }
    if (selectedField.moisturePercent < 18) {
      return `⚠️ Low moisture (${selectedField.moisturePercent}%) detected in ${selectedField.name}. Trigger micro-irrigation loop between 05:30 - 08:00 AM to prevent vegetative stress.`;
    }
    if (selectedField.ndviScore >= 0.88) {
      return `🌟 Peak vitality in ${selectedField.name} (${selectedField.cropType}) with NDVI ${selectedField.ndviScore}. Biomass accumulation is top-tier; optimal yield window ahead.`;
    }
    if (selectedField.soilPh < 6.1) {
      return `🧪 Soil pH in ${selectedField.name} is slightly acidic (${selectedField.soilPh}). Consider applying agricultural lime alongside STCR basal nutrients.`;
    }
    if (selectedField.soilPh > 7.6) {
      return `🧪 High alkaline index (${selectedField.soilPh}) in ${selectedField.name}. Incorporate gypsum amendment to improve nutrient assimilation.`;
    }
    return `${selectedField.name} (${selectedField.cropType}) is tracking at healthy NDVI ${selectedField.ndviScore} and ${selectedField.moisturePercent}% moisture. Baseline STCR schedule recommended.`;
  };

  const insightText = getFieldInsight();

  return (
    <div className="card card-hover p-5 h-full flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-500/20 dark:shadow-none">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-white">Vaidya AI</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-400">
            {selectedField ? `Insight · ${selectedField.name}` : 'Smart Farm Insight'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-full">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full pulse-dot" />
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Online</span>
        </div>
      </div>

      <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />

      {/* Auto insight */}
      <div className="flex-1 bg-gradient-to-br from-emerald-50 to-slate-50 dark:from-emerald-950/30 dark:to-slate-900/60 rounded-2xl p-3.5 border border-emerald-100/80 dark:border-emerald-800/50 flex flex-col justify-center transition-colors">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500 dark:text-cyan-400 flex-shrink-0 mt-0.5 animate-pulse" />
          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            {insightText}
          </p>
        </div>
      </div>

      {/* Trigger Button: Day Clean Emerald vs Night Cyber-Pill */}
      <button
        id="trigger-vaidya-drawer"
        onClick={onOpenDrawer}
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
          isNight
            ? 'neon-btn-cyber'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-98'
        }`}
      >
        <span>✨ Ask AI Recommendation</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
