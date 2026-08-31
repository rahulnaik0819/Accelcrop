import type { SensorReadings } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface ClimateOverviewProps {
  sensors: SensorReadings;
  efficiency?: number;
  fieldName?: string;
  cropType?: string;
}

// SVG semi-circle radial gauge with dual-theme support
function RadialGauge({
  value,
  max,
  unit,
  isNight,
}: {
  value: number;
  max: number;
  unit: string;
  isNight: boolean;
}) {
  const radius = 56;
  const cx = 80;
  const cy = 78;
  const circumference = Math.PI * radius; // half circle arc
  const pct = Math.min(value / max, 1);

  const startAngle = -180;
  const endAngle = 0;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcPath = `M ${cx + radius * Math.cos(toRad(startAngle))} ${cy + radius * Math.sin(toRad(startAngle))} A ${radius} ${radius} 0 0 1 ${cx + radius * Math.cos(toRad(endAngle))} ${cy + radius * Math.sin(toRad(endAngle))}`;

  const indicatorAngle = startAngle + pct * 180;
  const indicatorX = cx + radius * Math.cos(toRad(indicatorAngle));
  const indicatorY = cy + radius * Math.sin(toRad(indicatorAngle));

  return (
    <div className="relative flex flex-col items-center">
      <svg width="160" height="90" viewBox="0 0 160 90">
        <defs>
          <linearGradient id="gaugeGradDay" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="gaugeGradNight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="60%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Track */}
        <path
          d={arcPath}
          fill="none"
          stroke={isNight ? '#1e293b' : '#e2e8f0'}
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Value arc */}
        <path
          d={arcPath}
          fill="none"
          stroke={isNight ? 'url(#gaugeGradNight)' : 'url(#gaugeGradDay)'}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${pct * circumference} ${circumference}`}
          strokeDashoffset={0}
          className={isNight ? 'neon-glow-cyan' : ''}
        />

        {/* Indicator dot */}
        <circle
          cx={indicatorX}
          cy={indicatorY}
          r={5.5}
          fill={isNight ? '#00f2fe' : '#059669'}
          stroke={isNight ? '#ffffff' : '#ecfdf5'}
          strokeWidth={1.5}
          className={isNight ? 'neon-glow-cyan' : ''}
        />

        {/* Tick marks */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const a = toRad(startAngle + p * 180);
          const inner = 44;
          const outer = 52;
          return (
            <line
              key={i}
              x1={cx + inner * Math.cos(a)}
              y1={cy + inner * Math.sin(a)}
              x2={cx + outer * Math.cos(a)}
              y2={cy + outer * Math.sin(a)}
              stroke={isNight ? '#475569' : '#cbd5e1'}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* Value text */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fill={isNight ? '#ffffff' : '#0f172a'}
          style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Inter, sans-serif' }}
          className={isNight ? 'neon-text-emerald' : ''}
        >
          {value}
        </text>
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          fill={isNight ? '#94a3b8' : '#64748b'}
          style={{ fontSize: 10, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
        >
          {unit}
        </text>
      </svg>

      {/* Range labels */}
      <div className="flex justify-between w-32 -mt-2">
        <span className="text-[10px] text-slate-400">0°</span>
        <span className="text-[10px] text-slate-400">{max}°</span>
      </div>
    </div>
  );
}

export default function ClimateOverview({
  sensors,
  efficiency = 91.2,
  fieldName,
  cropType,
}: ClimateOverviewProps) {
  const { isNight } = useTheme();

  return (
    <div className="card card-hover p-5 h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Climate Overview
          </p>
          {fieldName && (
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
              {fieldName} {cropType ? `· ${cropType}` : ''}
            </p>
          )}
        </div>
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
          Live
        </span>
      </div>

      {/* Gauge */}
      <div className="flex justify-center my-auto">
        <RadialGauge
          value={sensors.temperature_c}
          max={50}
          unit="°C Temperature"
          isNight={isNight}
        />
      </div>

      {/* Efficiency bar */}
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            Farm Efficiency
          </span>
          <span
            className={`text-sm font-bold ${
              isNight ? 'neon-text-emerald' : 'text-emerald-600'
            }`}
          >
            {efficiency}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isNight
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
            }`}
            style={{ width: `${efficiency}%` }}
          />
        </div>
      </div>

      {/* Soil stats row */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-2.5 text-center border border-slate-100 dark:border-slate-800 transition-colors">
          <p className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold">
            Soil Moisture
          </p>
          <p
            className={`text-sm font-bold mt-0.5 ${
              isNight ? 'text-cyan-300' : 'text-slate-700'
            }`}
          >
            {sensors.soil_moisture_pct}%
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-2.5 text-center border border-slate-100 dark:border-slate-800 transition-colors">
          <p className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold">Soil pH</p>
          <p
            className={`text-sm font-bold mt-0.5 ${
              isNight ? 'text-emerald-300' : 'text-slate-700'
            }`}
          >
            {sensors.soil_ph}
          </p>
        </div>
      </div>
    </div>
  );
}
