import { CheckCircle2, Clock, Zap, Calendar } from 'lucide-react';

interface ScheduleWidgetProps {
  schedule: string;
}

const tasks = [
  { name: 'Pruning Task', zone: 'Zone A-3', status: 'Ongoing', icon: Zap },
  { name: 'Soil Sampling', zone: 'Zone B-1', status: 'Scheduled', icon: Clock },
  { name: 'Irrigation Check', zone: 'Zone C-2', status: 'Done', icon: CheckCircle2 },
];

const statusStyles: Record<string, string> = {
  Ongoing: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Scheduled: 'bg-amber-50 text-amber-700 border border-amber-200',
  Done: 'bg-slate-100 text-slate-500 border border-slate-200',
};

export default function ScheduleWidget({ schedule }: ScheduleWidgetProps) {
  return (
    <div className="card card-hover p-5 h-full flex flex-col gap-3">
      {/* Date badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Today</p>
            <p className="text-sm font-semibold text-slate-700">06 January</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-600 text-white tracking-wide">
          {schedule}
        </span>
      </div>

      <div className="w-full h-px bg-slate-100" />

      {/* Task list */}
      <div className="flex flex-col gap-2">
        {tasks.map((task) => {
          const Icon = task.icon;
          return (
            <div key={task.name} className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-default">
              <div className="flex items-center gap-2.5">
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">{task.name}</p>
                  <p className="text-[10px] text-slate-400">{task.zone}</p>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[task.status]}`}>
                {task.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
