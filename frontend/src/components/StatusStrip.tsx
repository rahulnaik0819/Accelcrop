import { CheckCircle2, Clock, Droplets, ChevronRight } from 'lucide-react';
import type { FieldActivity } from '../services/api';

interface StatusStripProps {
  activities: FieldActivity[];
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; colors: string; dot: string; label: string }> = {
  Completed: {
    icon: CheckCircle2,
    colors: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Completed',
  },
  Upcoming: {
    icon: Clock,
    colors: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-400',
    label: 'Upcoming',
  },
  Running: {
    icon: Droplets,
    colors: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    label: 'Running',
  },
};

export default function StatusStrip({ activities }: StatusStripProps) {
  return (
    <div className="card p-4 flex items-center gap-3 overflow-x-auto scrollbar-hide">
      <div className="flex-shrink-0 flex items-center gap-2 pr-4 border-r border-slate-200">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">Field Activities</p>
      </div>

      <div className="flex items-center gap-3 flex-1 overflow-x-auto scrollbar-hide">
        {activities.map((act, i) => {
          const cfg = statusConfig[act.status] ?? statusConfig.Upcoming;
          const Icon = cfg.icon;
          return (
            <div key={i} className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${cfg.colors} cursor-default hover:shadow-sm transition-shadow`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot} ${act.status === 'Running' ? 'pulse-dot' : ''}`} />
              <div>
                <p className="text-xs font-semibold whitespace-nowrap">{act.activity}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Icon className="w-3 h-3 opacity-70" />
                  <span className="text-[10px] font-medium opacity-80">{cfg.label}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Placeholder spacer */}
        <button className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-colors text-xs font-medium">
          View all
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
