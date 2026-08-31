import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import type { SensorReadings } from '../services/api';
import { useFarm } from '../context/FarmContext';
import { TrendingUp, Droplets, FlaskConical, Thermometer } from 'lucide-react';

interface CropHealthViewProps {
  sensors: SensorReadings;
}

const tempTrend = [
  { day: 'Mon', temp: 26, humidity: 62 },
  { day: 'Tue', temp: 28, humidity: 58 },
  { day: 'Wed', temp: 30, humidity: 55 },
  { day: 'Thu', temp: 27, humidity: 61 },
  { day: 'Fri', temp: 25, humidity: 67 },
  { day: 'Sat', temp: 28, humidity: 63 },
  { day: 'Sun', temp: 29, humidity: 59 },
];

const radarData = [
  { metric: 'Moisture', value: 72 },
  { metric: 'Soil pH', value: 85 },
  { metric: 'Veg. Index', value: 78 },
  { metric: 'Temperature', value: 65 },
  { metric: 'Growth Rate', value: 88 },
  { metric: 'Yield Trend', value: 60 },
];

const FIELD_COLORS = ['#10b981', '#34d399', '#f59e0b', '#ef4444', '#38bdf8', '#a855f7', '#ec4899', '#eab308'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function CropHealthView({ sensors }: CropHealthViewProps) {
  const { farmLocation, fields } = useFarm();

  const viData = fields.map(f => ({
    field: f.name,
    vi: f.ndviScore,
    moisture: f.moisturePercent,
    ph: f.soilPh
  }));

  const moistureTrend = [
    {
      week: 'W1',
      ...fields.reduce((acc, f) => ({ ...acc, [f.name]: f.moisturePercent + 1.8 }), {}),
    },
    {
      week: 'W2',
      ...fields.reduce((acc, f) => ({ ...acc, [f.name]: f.moisturePercent + 1.4 }), {}),
    },
    {
      week: 'W3',
      ...fields.reduce((acc, f) => ({ ...acc, [f.name]: f.moisturePercent + 0.9 }), {}),
    },
    {
      week: 'W4',
      ...fields.reduce((acc, f) => ({ ...acc, [f.name]: f.moisturePercent + 0.5 }), {}),
    },
    {
      week: 'W5',
      ...fields.reduce((acc, f) => ({ ...acc, [f.name]: f.moisturePercent + 0.2 }), {}),
    },
    {
      week: 'W6',
      ...fields.reduce((acc, f) => ({ ...acc, [f.name]: f.moisturePercent }), {}),
    },
  ];

  return (
    <div className="flex flex-col gap-6 fade-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Crop Health & Analytics</h1>
          <p className="text-xs text-slate-400">
            {farmLocation.name} · Real-time vegetation vitality, soil, and climate indicators for {fields.length} parcels
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { icon: Droplets, label: `${sensors.soil_moisture_pct}% Moisture`, color: 'text-blue-600 bg-blue-50 border-blue-200' },
            { icon: FlaskConical, label: `pH ${sensors.soil_ph}`, color: 'text-purple-600 bg-purple-50 border-purple-200' },
            { icon: Thermometer, label: `${sensors.temperature_c}°C`, color: 'text-orange-600 bg-orange-50 border-orange-200' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold ${color}`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* VI Bar chart */}
        <div className="col-span-12 lg:col-span-6 card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">NDVI Vegetation Index by Field</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={viData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="field" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="vi" name="NDVI Index" radius={[6, 6, 0, 0]} fill="#10b981">
                {viData.map((_, i) => (
                  <rect key={i} fill={FIELD_COLORS[i % FIELD_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="col-span-12 lg:col-span-6 card p-5">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-4">Overall Farm Health Score</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Radar name="Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Moisture Trend */}
        <div className="col-span-12 card p-5">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-4">Soil Moisture Trend — 6 Weeks (% by field)</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={moistureTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} domain={[10, 30]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {fields.map((f, i) => (
                <Line
                  key={f.id}
                  type="monotone"
                  dataKey={f.name}
                  stroke={FIELD_COLORS[i % FIELD_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Temperature/Humidity week */}
        <div className="col-span-12 lg:col-span-8 card p-5">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-4">Temperature & Humidity — This Week</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tempTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="temp" name="Temp (°C)" stroke="#f97316" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Soil pH table */}
        <div className="col-span-12 lg:col-span-4 card p-5">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-4">Soil pH Distribution</p>
          <div className="flex flex-col gap-3">
            {fields.map((f, i) => {
              const pct = ((f.soilPh - 5.0) / 3.0) * 100;
              const good = f.soilPh >= 6.0 && f.soilPh <= 7.0;
              return (
                <div key={f.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-600">{f.name}</span>
                    <span className={`font-bold ${good ? 'text-emerald-600' : 'text-amber-600'}`}>pH {f.soilPh}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.max(5, Math.min(100, pct))}%`, background: FIELD_COLORS[i % FIELD_COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 mt-4">Optimal range: 6.0 – 7.0 for field crops</p>
        </div>
      </div>
    </div>
  );
}
