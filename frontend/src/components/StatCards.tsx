import { Sprout, Grid3x3 } from 'lucide-react';

interface StatCardsProps {
  cultivatedArea: number;
  activeCropZones: number;
}

export default function StatCards({ cultivatedArea, activeCropZones }: StatCardsProps) {
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Cultivated Area */}
      <div className="card card-hover p-4 flex-1 flex items-center gap-4 group">
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
          <Sprout className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Total Cultivated Area</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold text-slate-800 tabular-nums">{cultivatedArea}</span>
            <span className="text-sm font-medium text-slate-500">Acres</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((cultivatedArea / 200) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Crop Zones */}
      <div className="card card-hover p-4 flex-1 flex items-center gap-4 group">
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
          <Grid3x3 className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Active Crop Zones</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold text-slate-800 tabular-nums">
              {String(activeCropZones).padStart(2, '0')}
            </span>
            <span className="text-sm font-medium text-slate-500">Zones</span>
          </div>
          {/* Zone dots */}
          <div className="flex gap-1.5 mt-2">
            {Array.from({ length: activeCropZones }).map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                style={{ opacity: 1 - i * 0.1 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
