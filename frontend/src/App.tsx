import { useEffect, useState } from 'react';
import { api, MOCK_DASHBOARD, MOCK_PREDICT, MOCK_ZONES } from './services/api';
import type { DashboardOverview, PredictResponse, FieldZonesResponse } from './services/api';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FarmProvider, useFarm } from './context/FarmContext';

import Sidebar, { type Route } from './components/Sidebar';
import Header from './components/Header';
import VaidyaDrawer from './components/VaidyaDrawer';
import AccountModal from './components/AccountModal';
import FertilizerOptimizerModal from './components/FertilizerOptimizerModal';
import WaterPumpLoggerModal from './components/WaterPumpLoggerModal';
import LoginModal from './components/LoginModal';

import OverviewView from './views/OverviewView';
import MonitoringView from './views/MonitoringView';
import CropHealthView from './views/CropHealthView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';

function AppContent() {
  const { isAuthenticated } = useAuth();

  // ── Data state ────────────────────────────────────────────────────────────
  const [dashboard, setDashboard] = useState<DashboardOverview>(MOCK_DASHBOARD);
  const [predict, setPredict] = useState<PredictResponse>(MOCK_PREDICT);
  const [zones, setZones] = useState<FieldZonesResponse>(MOCK_ZONES);
  const [loading, setLoading] = useState(true);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeRoute, setActiveRoute] = useState<Route>('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [optimizerOpen, setOptimizerOpen] = useState(false);
  const [waterLoggerOpen, setWaterLoggerOpen] = useState(false);

  const { fields, selectedFieldId, selectedField, selectField, totalFarmAcres, totalProductionTonnes } = useFarm();

  // ── Boot fetch ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const [d, p, z] = await Promise.all([
        api.getDashboard(),
        api.predict({
          crop_type: 'Wheat',
          zone_id: 'Z1',
          soil_ph: 6.4,
          soil_moisture_pct: 21.4,
          temperature_c: 28,
          area_acres: 128.0,
          state: 'Punjab',
          season: 'Rabi',
          annual_rainfall: 650.0,
          fertilizer_kg_ha: 180.0,
          pesticide_kg_ha: 3.5,
        }),
        api.getZones(),
      ]);
      setDashboard(d);
      setPredict(p);
      setZones(z);
      setLoading(false);
    }
    load();
  }, []);

  // ── Field activity handler ────────────────────────────────────────────────
  const handleApplyActivity = (activity: string, status: 'Completed' | 'Upcoming' | 'Running' = 'Running') => {
    setDashboard((prev) => {
      const existingIdx = prev.field_activity_statuses.findIndex((a) => a.activity === activity);
      const newStatuses = [...prev.field_activity_statuses];
      if (existingIdx > -1) {
        newStatuses[existingIdx] = { activity, status };
      } else {
        newStatuses.push({ activity, status });
      }
      return { ...prev, field_activity_statuses: newStatuses };
    });
  };

  const active = selectedField || fields[0];

  const sensors = {
    soil_moisture_pct: active?.moisturePercent || predict.sensor_readings.soil_moisture_pct,
    soil_ph: active?.soilPh || predict.sensor_readings.soil_ph,
    temperature_c: predict.sensor_readings.temperature_c,
  };

  const telemetry = {
    activeField: active?.name || 'Field 01',
    moisturePct: active?.moisturePercent || 21.4,
    forecastedYieldTons: Math.round(totalProductionTonnes) || 612,
    yieldVariancePct: predict.variance_pct,
    temperatureC: sensors.temperature_c,
    soilPh: sensors.soil_ph,
  };

  // ── View renderer ─────────────────────────────────────────────────────────
  function renderView() {
    switch (activeRoute) {
      case 'overview':
        return (
          <OverviewView
            dashboard={dashboard}
            predict={predict}
            zones={zones}
            sensors={sensors}
            selectedField={selectedFieldId}
            onSelectField={selectField}
            onOpenDrawer={() => setDrawerOpen(true)}
            onOpenOptimizer={() => setOptimizerOpen(true)}
            onOpenWaterLogger={() => setWaterLoggerOpen(true)}
            loading={loading}
          />
        );
      case 'monitoring':
        return (
          <MonitoringView
            sensors={sensors}
            activities={dashboard.field_activity_statuses}
            selectedField={selectedFieldId}
            onSelectField={selectField}
            onOpenOptimizer={() => setOptimizerOpen(true)}
            onOpenWaterLogger={() => setWaterLoggerOpen(true)}
          />
        );
      case 'crop-health':
        return <CropHealthView sensors={sensors} />;
      case 'reports':
        return <ReportsView predict={predict} dashboard={dashboard} />;
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {!isAuthenticated && <LoginModal />}

      <Sidebar
        activeRoute={activeRoute}
        onNavigate={setActiveRoute}
        onOpenAccount={() => setAccountOpen(true)}
      />
      <Header
        activeRoute={activeRoute}
        onNavigate={setActiveRoute}
        onOpenAccount={() => setAccountOpen(true)}
      />

      <main className="ml-16 pt-14 p-5 min-h-screen">
        {renderView()}

        <footer className="mt-8 text-center text-[10px] text-slate-400 dark:text-slate-400 pb-4">
          ACCELCORP · AgriVision Zero-Hardware Intelligence Platform · © 2026
        </footer>
      </main>

      {/* Vaidya AI Drawer */}
      <VaidyaDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        telemetry={telemetry}
        onApplyActivity={handleApplyActivity}
        onOpenOptimizer={() => setOptimizerOpen(true)}
        onOpenWaterLogger={() => setWaterLoggerOpen(true)}
      />

      {/* Account Modal */}
      <AccountModal
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
      />

      {/* STCR Fertilizer Optimizer Modal */}
      <FertilizerOptimizerModal
        isOpen={optimizerOpen}
        onClose={() => setOptimizerOpen(false)}
        initialCrop={active?.cropType || 'Wheat'}
        initialArea={Math.round(totalFarmAcres) || 128}
        initialSoilPh={sensors.soil_ph}
        onApplyToSchedule={(act) => handleApplyActivity(act, 'Running')}
      />

      {/* Water & Pump Logger Modal */}
      <WaterPumpLoggerModal
        isOpen={waterLoggerOpen}
        onClose={() => setWaterLoggerOpen(false)}
        initialArea={Math.round(totalFarmAcres) || 128}
        onApplyActivity={(act) => handleApplyActivity(act, 'Running')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FarmProvider>
          <AppContent />
        </FarmProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
