import { useState } from 'react';
import { Sliders, Droplets, FlaskConical, Bell, Mail, MessageSquare, Smartphone, Save, RotateCcw } from 'lucide-react';

interface SettingValue {
  cropType: string;
  farmArea: number;
  zoneCount: number;
  moistureMin: number;
  moistureMax: number;
  phMin: number;
  phMax: number;
  tempAlert: number;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    weeklyReport: boolean;
    criticalAlerts: boolean;
  };
}

const DEFAULT: SettingValue = {
  cropType: 'Wheat',
  farmArea: 128,
  zoneCount: 6,
  moistureMin: 20,
  moistureMax: 35,
  phMin: 6.0,
  phMax: 7.5,
  tempAlert: 38,
  notifications: {
    email: true,
    sms: false,
    push: true,
    weeklyReport: true,
    criticalAlerts: true,
  },
};

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5.5 rounded-full transition-all duration-300 flex-shrink-0 ${value ? 'bg-emerald-500' : 'bg-slate-200'}`}
      style={{ height: '22px' }}
    >
      <span
        className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-all duration-300 ${value ? 'left-5' : 'left-0.5'}`}
        style={{ width: '18px', height: '18px' }}
      />
    </button>
  );
}

export default function SettingsView() {
  const [settings, setSettings] = useState<SettingValue>(DEFAULT);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof SettingValue>(key: K, val: SettingValue[K]) =>
    setSettings(s => ({ ...s, [key]: val }));

  const updateNotif = (key: keyof SettingValue['notifications'], val: boolean) =>
    setSettings(s => ({ ...s, notifications: { ...s.notifications, [key]: val } }));

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => setSettings(DEFAULT);

  return (
    <div className="flex flex-col gap-6 fade-up max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Settings</h1>
          <p className="text-xs text-slate-400">Farm parameters, sensor calibration & alert configuration</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={save} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-sm">
            <Save className="w-3.5 h-3.5" /> {saved ? 'Saved ✓' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Farm Parameters */}
      <div className="card p-5 flex flex-col gap-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sliders className="w-4 h-4 text-emerald-600" />
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Farm Parameters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Crop Type</label>
            <select
              value={settings.cropType}
              onChange={e => update('cropType', e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-300 transition"
            >
              {['Wheat', 'Rice', 'Maize', 'Sugarcane', 'Cotton', 'Mustard', 'Soybean'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Farm Area (acres)</label>
            <input
              type="number"
              value={settings.farmArea}
              onChange={e => update('farmArea', +e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-300 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Zone Count: <span className="text-emerald-600">{settings.zoneCount}</span></label>
            <input
              type="range"
              min={1} max={12}
              value={settings.zoneCount}
              onChange={e => update('zoneCount', +e.target.value)}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1</span><span>12</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Temperature Alert Threshold: <span className="text-orange-600">{settings.tempAlert}°C</span></label>
            <input
              type="range"
              min={25} max={50}
              value={settings.tempAlert}
              onChange={e => update('tempAlert', +e.target.value)}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>25°C</span><span>50°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Calibration */}
      <div className="card p-5 flex flex-col gap-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Droplets className="w-4 h-4 text-blue-500" />
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sensor Calibration & Alert Thresholds</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { icon: Droplets, label: 'Moisture Min (%)', field: 'moistureMin' as const, min: 0, max: 50, color: 'text-blue-600' },
            { icon: Droplets, label: 'Moisture Max (%)', field: 'moistureMax' as const, min: 0, max: 100, color: 'text-blue-600' },
            { icon: FlaskConical, label: 'Soil pH Min', field: 'phMin' as const, min: 4, max: 8, color: 'text-purple-600', step: 0.1 },
            { icon: FlaskConical, label: 'Soil pH Max', field: 'phMax' as const, min: 4, max: 9, color: 'text-purple-600', step: 0.1 },
          ].map(({ icon: Icon, label, field, min, max, color, step }) => (
            <div key={field} className="flex flex-col gap-1.5">
              <label className={`text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1`}>
                <Icon className={`w-3 h-3 ${color}`} /> {label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings[field]}
                  step={step ?? 1}
                  min={min}
                  max={max}
                  onChange={e => update(field, +e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-300 transition"
                />
                <span className={`text-sm font-bold ${color} tabular-nums w-10`}>{settings[field]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Bell className="w-4 h-4 text-amber-500" />
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Notifications</p>
        </div>

        {[
          { icon: Mail, label: 'Email Notifications', sub: 'Receive alerts via email', key: 'email' as const },
          { icon: MessageSquare, label: 'SMS Alerts', sub: 'Critical field alerts via SMS', key: 'sms' as const },
          { icon: Smartphone, label: 'Push Notifications', sub: 'Browser/mobile push alerts', key: 'push' as const },
          { icon: Bell, label: 'Critical Alerts', sub: 'Immediate notification for critical issues', key: 'criticalAlerts' as const },
          { icon: Bell, label: 'Weekly Report', sub: 'Automated weekly performance digest', key: 'weeklyReport' as const },
        ].map(({ icon: Icon, label, sub, key }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">{label}</p>
                <p className="text-[10px] text-slate-400">{sub}</p>
              </div>
            </div>
            <Toggle value={settings.notifications[key]} onChange={v => updateNotif(key, v)} />
          </div>
        ))}
      </div>
    </div>
  );
}
