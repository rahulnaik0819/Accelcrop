import type { ResourceUsage } from '../services/api';
import { Droplets, Users, Cpu } from 'lucide-react';

interface ResourceUsageWidgetProps {
  usage: ResourceUsage;
}

const resources = (usage: ResourceUsage) => [
  {
    icon: Droplets,
    label: 'Water Usage',
    value: usage.water_pct,
    color: 'bg-blue-500',
    trackColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    dotColor: 'bg-blue-500',
  },
  {
    icon: Users,
    label: 'Labor Utilization',
    value: usage.labor_pct,
    color: 'bg-emerald-500',
    trackColor: 'bg-emerald-100',
    textColor: 'text-emerald-600',
    dotColor: 'bg-emerald-500',
  },
  {
    icon: Cpu,
    label: 'Equipment Idle',
    value: usage.equipment_idle_pct,
    color: 'bg-amber-400',
    trackColor: 'bg-amber-100',
    textColor: 'text-amber-600',
    dotColor: 'bg-amber-400',
  },
];

// Dot indicator rating bar
function RatingBar({ value }: { value: number }) {
  const totalDots = 10;
  const filled = Math.round((value / 100) * totalDots);
  const rating = value >= 60 ? 'Optimized' : value >= 30 ? 'Moderate' : 'Inefficient';
  const ratingColor = value >= 60 ? 'text-emerald-600' : value >= 30 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-400 w-16">Inefficient</span>
      <div className="flex gap-1 flex-1">
        {Array.from({ length: totalDots }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
              i < filled ? 'bg-emerald-400' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <span className={`text-[10px] font-semibold ${ratingColor} w-16 text-right`}>{rating}</span>
    </div>
  );
}

export default function ResourceUsageWidget({ usage }: ResourceUsageWidgetProps) {
  const items = resources(usage);

  return (
    <div className="card card-hover p-5 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resource Usage</p>
        <span className="text-[10px] text-slate-400">This Week</span>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${item.textColor}`} />
                  <span className="text-xs font-medium text-slate-600">{item.label}</span>
                </div>
                <span className={`text-sm font-bold ${item.textColor} tabular-nums`}>{item.value}%</span>
              </div>
              <div className={`w-full h-2 ${item.trackColor} rounded-full overflow-hidden`}>
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-100 pt-3">
        <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-wider">Overall Efficiency Rating</p>
        <RatingBar value={usage.water_pct} />
      </div>
    </div>
  );
}
