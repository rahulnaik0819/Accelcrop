import type { DashboardOverview, PredictResponse, FieldZonesResponse, SensorReadings } from '../services/api';
import ScheduleWidget from '../components/ScheduleWidget';
import StatCards from '../components/StatCards';
import ClimateOverview from '../components/ClimateOverview';
import ResourceUsageWidget from '../components/ResourceUsageWidget';
import AIInsight from '../components/AIInsight';
import FieldMap from '../components/FieldMap';
import YieldForecast from '../components/YieldForecast';
import StatusStrip from '../components/StatusStrip';
import { Sparkles, Droplets, MapPin, Plus } from 'lucide-react';
import { useFarm } from '../context/FarmContext';

interface OverviewViewProps {
  dashboard: DashboardOverview;
  predict: PredictResponse;
  zones: FieldZonesResponse;
  sensors: SensorReadings;
  selectedField: string;
  onSelectField: (id: string) => void;
  onOpenDrawer: () => void;
  onOpenOptimizer?: () => void;
  onOpenWaterLogger?: () => void;
  loading: boolean;
}

export default function OverviewView({
  dashboard,
  predict,
  onOpenDrawer,
  onOpenOptimizer,
  onOpenWaterLogger,
  loading,
}: OverviewViewProps) {
  const { farmLocation, fields, selectedField, setDrawingMode } = useFarm();

  const activeField = selectedField || fields[0];

  const currentSensors: SensorReadings = {
    soil_moisture_pct: activeField?.moisturePercent || 21.4,
    soil_ph: activeField?.soilPh || 6.4,
    temperature_c: predict.sensor_readings.temperature_c || 28.0,
  };

  const totalAcres = fields.reduce((acc, f) => acc + f.areaAcres, 0);

  return (
    <div className="grid grid-cols-12 gap-4" style={{ gridTemplateRows: 'auto' }}>
      {/* Location Banner & Quick Action Pills */}
      <div className="col-span-12 flex flex-wrap items-center justify-between gap-3 -mb-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{farmLocation.name}</span>
            {farmLocation.state && <span className="text-slate-400 font-normal">({farmLocation.state})</span>}
          </div>

          {onOpenOptimizer && (
            <button
              onClick={onOpenOptimizer}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800 hover:bg-emerald-100 shadow-sm transition-all hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              STCR Fertilizer Optimizer
            </button>
          )}

          {onOpenWaterLogger && (
            <button
              onClick={onOpenWaterLogger}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-100/70 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300/80 dark:border-blue-800 hover:bg-blue-100 shadow-sm transition-all hover:scale-105 cursor-pointer"
            >
              <Droplets className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Water & Pump Logger
            </button>
          )}

          <button
            onClick={() => setDrawingMode('square')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            + Draw New Parcel
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Syncing with backend…</span>
          </div>
        )}
      </div>

      {/* ROW 1 */}
      <div className="col-span-12 lg:col-span-3 fade-up" style={{ animationDelay: '0ms' }}>
        <ScheduleWidget schedule={dashboard.active_farm_schedule} />
      </div>
      <div className="col-span-6 lg:col-span-2 fade-up" style={{ animationDelay: '60ms' }}>
        <StatCards
          cultivatedArea={Math.round(totalAcres * 10) / 10}
          activeCropZones={fields.length}
        />
      </div>
      <div className="col-span-6 lg:col-span-2 fade-up" style={{ animationDelay: '120ms' }}>
        <ClimateOverview
          sensors={currentSensors}
          efficiency={91.2}
          fieldName={activeField?.name}
          cropType={activeField?.cropType}
        />
      </div>
      <div className="col-span-12 lg:col-span-2 fade-up" style={{ animationDelay: '180ms' }}>
        <ResourceUsageWidget usage={predict.resource_usage} />
      </div>
      <div className="col-span-12 lg:col-span-3 fade-up" style={{ animationDelay: '240ms' }}>
        <AIInsight onOpenDrawer={onOpenDrawer} selectedField={activeField} />
      </div>

      {/* ROW 2 */}
      <div className="col-span-12 lg:col-span-8 fade-up" style={{ animationDelay: '300ms' }}>
        <FieldMap onOpenOptimizer={onOpenOptimizer} onOpenWaterLogger={onOpenWaterLogger} />
      </div>
      <div className="col-span-12 lg:col-span-4 fade-up" style={{ animationDelay: '360ms' }}>
        <YieldForecast
          predictedYield={activeField?.predictedYieldTonnesPerHa || predict.predicted_yield_tonnes_per_ha}
          variancePct={predict.variance_pct}
          totalProductionTonnes={activeField?.totalProductionTonnes}
          fieldName={activeField?.name}
          cropType={activeField?.cropType}
          areaAcres={activeField?.areaAcres}
        />
      </div>

      {/* ROW 3 */}
      <div className="col-span-12 fade-up" style={{ animationDelay: '420ms' }}>
        <StatusStrip activities={dashboard.field_activity_statuses} />
      </div>
    </div>
  );
}
