import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface YieldForecastProps {
  predictedYield: number;
  variancePct: number;
  totalProductionTonnes?: number;
  fieldName?: string;
  cropType?: string;
  areaAcres?: number;
}

const generateWeeklyData = (baseYield: number) => [
  { week: 'W1', forecast: Math.round(baseYield * 0.85), actual: Math.round(baseYield * 0.82) },
  { week: 'W2', forecast: Math.round(baseYield * 0.92), actual: Math.round(baseYield * 0.88) },
  { week: 'W3', forecast: Math.round(baseYield * 0.98), actual: Math.round(baseYield * 0.95) },
  { week: 'W4', forecast: Math.round(baseYield * 0.94), actual: Math.round(baseYield * 0.91) },
  { week: 'W5', forecast: Math.round(baseYield * 1.05), actual: Math.round(baseYield * 1.02) },
  { week: 'W6', forecast: Math.round(baseYield * 1.15), actual: Math.round(baseYield * 1.09) },
  { week: 'W7', forecast: Math.round(baseYield * 1.1), actual: null },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-cyan-500/30 rounded-2xl p-2.5 shadow-xl text-xs dark:shadow-[0_0_15px_rgba(6,182,212,0.15)]">
        <p className="font-bold text-slate-800 dark:text-white mb-1">{label}</p>
        {payload.map((p) => (
          <p
            key={p.name}
            style={{ color: p.color }}
            className="font-semibold flex items-center justify-between gap-3"
          >
            <span>{p.name}:</span>
            <span className="font-bold">{p.value} t</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function YieldForecast({
  predictedYield,
  variancePct,
  totalProductionTonnes,
  fieldName,
  cropType,
  areaAcres,
}: YieldForecastProps) {
  const { isNight } = useTheme();

  const displayTons = totalProductionTonnes
    ? Math.round(totalProductionTonnes)
    : areaAcres
    ? Math.round(areaAcres * 0.404686 * (predictedYield || 45.2))
    : 612;

  const weeklyData = generateWeeklyData(Math.round(displayTons / 6.5) || 95);
  const isNegative = variancePct < 0;

  return (
    <div className="card card-hover p-5 h-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase tracking-widest font-bold">
            Forecasted Yield {fieldName ? `· ${fieldName}` : ''}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-4xl font-bold tabular-nums leading-none ${
                isNight ? 'neon-text-cyan' : 'text-slate-800'
              }`}
            >
              {displayTons}
            </span>
            <span className="text-base font-medium text-slate-500 dark:text-slate-400">tons</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-1">
            ≈ {predictedYield} t/ha {cropType ? `· ${cropType}` : ''} · Current Cycle
          </p>
        </div>
        <div
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border ${
            isNegative
              ? 'bg-red-50 dark:bg-red-950/60 border-red-100 dark:border-red-800'
              : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-800'
          }`}
        >
          <TrendingDown
            className={`w-3.5 h-3.5 ${
              isNegative ? 'text-red-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'
            }`}
          />
          <span
            className={`text-sm font-bold ${
              isNegative ? 'text-red-600 dark:text-rose-300' : 'text-emerald-600 dark:text-emerald-300'
            }`}
          >
            {variancePct > 0 ? '+' : ''}
            {variancePct}%
          </span>
          <span className="text-[9px] text-slate-400 ml-1">vs baseline</span>
        </div>
      </div>

      {/* Recharts dual bar chart */}
      <div className="flex-1" style={{ minHeight: 125 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} barCategoryGap="25%" barGap={2}>
            <defs>
              <linearGradient id="neonCyanEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00f2fe" stopOpacity={1} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="neonEmeraldDeep" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#047857" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isNight ? '#1e293b' : '#f1f5f9'}
              vertical={false}
            />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: isNight ? '#64748b' : '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: isNight ? '#64748b' : '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="forecast" name="Forecast" radius={[4, 4, 0, 0]}>
              {weeklyData.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    i === weeklyData.length - 1
                      ? isNight
                        ? '#0e3a44'
                        : '#d1fae5'
                      : isNight
                      ? 'url(#neonCyanEmerald)'
                      : '#10b981'
                  }
                  className={isNight ? 'neon-glow-cyan' : ''}
                />
              ))}
            </Bar>
            <Bar dataKey="actual" name="Actual" radius={[4, 4, 0, 0]}>
              {weeklyData.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    i === weeklyData.length - 1
                      ? 'transparent'
                      : isNight
                      ? 'url(#neonEmeraldDeep)'
                      : '#059669'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-4">
        {[
          {
            color: isNight ? 'bg-cyan-400 shadow-[0_0_8px_#00f2fe]' : 'bg-emerald-400',
            label: 'Forecast',
          },
          {
            color: isNight ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-emerald-600',
            label: 'Actual',
          },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
            <span className="text-[10px] text-slate-400 dark:text-slate-400">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
