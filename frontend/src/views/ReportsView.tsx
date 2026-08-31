import { useState } from 'react';
import type { PredictResponse, DashboardOverview } from '../services/api';
import { useFarm } from '../context/FarmContext';
import { FileDown, Printer, TrendingDown, TrendingUp, Droplets, Users, Cpu, BarChart2 } from 'lucide-react';

interface ReportsViewProps {
  predict: PredictResponse;
  dashboard: DashboardOverview;
}

const WEEKLY_YIELD = [
  { week: 'W1', forecast: 88, actual: 85, variance: -3.4 },
  { week: 'W2', forecast: 95, actual: 91, variance: -4.2 },
  { week: 'W3', forecast: 102, actual: 99, variance: -2.9 },
  { week: 'W4', forecast: 98, actual: 94, variance: -4.1 },
  { week: 'W5', forecast: 110, actual: 107, variance: -2.7 },
  { week: 'W6', forecast: 119, actual: 112, variance: -5.9 },
  { week: 'W7', forecast: 115, actual: null, variance: null },
];

export default function ReportsView({ predict, dashboard }: ReportsViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'season'>('week');
  const { farmLocation, fields, totalFarmAcres, totalProductionTonnes } = useFarm();

  const downloadCSV = () => {
    const header = ['Field Name', 'Crop Type', 'Area (Acres)', 'NDVI Score', 'Moisture (%)', 'Soil pH', 'Health Status', 'Est. Yield (t/ha)', 'Total Production (t)'];
    const rows = fields.map(f => [
      f.name,
      f.cropType,
      f.areaAcres,
      f.ndviScore,
      f.moisturePercent,
      f.soilPh,
      f.healthStatus,
      f.predictedYieldTonnesPerHa || 45.2,
      f.totalProductionTonnes || (f.areaAcres * 0.404686 * 45.2).toFixed(1),
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agrivision_${farmLocation.name.toLowerCase().replace(/\s+/g, '_')}_audit_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summaryCards = [
    {
      icon: BarChart2,
      label: 'Total Forecasted Yield',
      value: `${totalProductionTonnes.toLocaleString()} t`,
      sub: `≈ ${(totalProductionTonnes / (totalFarmAcres * 0.404686 || 1)).toFixed(1)} t/ha`,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      trend: null,
    },
    {
      icon: predict.variance_pct < 0 ? TrendingDown : TrendingUp,
      label: 'Yield Variance',
      value: `${predict.variance_pct > 0 ? '+' : ''}${predict.variance_pct}%`,
      sub: 'vs. baseline this cycle',
      color: 'text-red-600 bg-red-50 border-red-100',
      trend: predict.variance_pct,
    },
    {
      icon: Droplets,
      label: 'Water Usage',
      value: `${predict.resource_usage.water_pct}%`,
      sub: 'of seasonal allocation',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      trend: null,
    },
    {
      icon: Users,
      label: 'Labour Utilisation',
      value: `${predict.resource_usage.labor_pct}%`,
      sub: 'workforce engaged',
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      trend: null,
    },
    {
      icon: Cpu,
      label: 'Equipment Idle',
      value: `${predict.resource_usage.equipment_idle_pct}%`,
      sub: 'machinery unutilised',
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      trend: null,
    },
    {
      icon: BarChart2,
      label: 'Active Zones',
      value: `${fields.length}`,
      sub: `${totalFarmAcres} acres cultivated`,
      color: 'text-slate-600 bg-slate-50 border-slate-200',
      trend: null,
    },
  ];

  return (
    <div className="flex flex-col gap-6 fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Production Reports</h1>
          <p className="text-xs text-slate-400">
            {farmLocation.name} ({farmLocation.state}) · Yield summaries, variance tables, and audit exports — {dashboard.active_farm_schedule}
          </p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'season'] as const).map(p => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all capitalize cursor-pointer ${
                selectedPeriod === p ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {summaryCards.map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className={`card p-4 border ${color.split(' ').slice(2).join(' ')}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${color.split(' ').slice(0, 2).join(' ')}`}>
              <Icon className={`w-4 h-4 ${color.split(' ')[0]}`} />
            </div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider leading-tight mb-1">{label}</p>
            <p className="text-xl font-bold text-slate-800 tabular-nums">{value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Field breakdown table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Field-by-Field Yield & Telemetry Breakdown</p>
            <p className="text-[10px] text-slate-400">Displaying all {fields.length} parcels in active farm network</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadCSV}
              id="export-csv-btn"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-sm shadow-emerald-100 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Report
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                {['Field', 'Crop', 'Area (Ac)', 'NDVI Vitality', 'Moisture %', 'Soil pH', 'Status', 'Est. Yield', 'Production'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((f) => {
                const estYield = f.predictedYieldTonnesPerHa || 45.2;
                const prod = f.totalProductionTonnes || Math.round(f.areaAcres * 0.404686 * estYield * 10) / 10;
                return (
                  <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">{f.name}</td>
                    <td className="py-3 px-3 text-slate-600">{f.cropType}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium tabular-nums">{f.areaAcres}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${f.ndviScore * 100}%` }} />
                        </div>
                        <span className="text-slate-600 tabular-nums">{f.ndviScore}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 tabular-nums">{f.moisturePercent}%</td>
                    <td className="py-3 px-3 text-slate-600 tabular-nums">{f.soilPh}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        f.healthStatus === 'Optimal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : f.healthStatus === 'Below Optimal' ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                      }`}>{f.healthStatus}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800 tabular-nums">{estYield} t/ha</td>
                    <td className="py-3 px-3 font-bold text-emerald-700 tabular-nums">{prod} t</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly yield table */}
      <div className="card p-5">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-4">Weekly Yield Forecast vs Actual</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                {['Week', 'Forecast (t)', 'Actual (t)', 'Variance (%)', 'Status'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WEEKLY_YIELD.map(row => (
                <tr key={row.week} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-700">{row.week}</td>
                  <td className="py-2.5 px-3 text-slate-600 tabular-nums">{row.forecast}</td>
                  <td className="py-2.5 px-3 text-slate-600 tabular-nums">{row.actual ?? <span className="text-slate-300">Pending</span>}</td>
                  <td className="py-2.5 px-3">
                    {row.variance !== null
                      ? <span className={`font-bold tabular-nums ${row.variance < 0 ? 'text-red-500' : 'text-emerald-600'}`}>{row.variance > 0 ? '+' : ''}{row.variance}%</span>
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-2.5 px-3">
                    {row.actual === null
                      ? <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-semibold border border-slate-200">Projected</span>
                      : row.variance! < -4
                        ? <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-semibold border border-red-100">At Risk</span>
                        : <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold border border-emerald-100">On Track</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
