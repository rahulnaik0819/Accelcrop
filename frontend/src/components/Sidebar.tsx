import { Home, Map, Leaf, BarChart2, Settings, ChevronRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export type Route = 'overview' | 'monitoring' | 'crop-health' | 'reports' | 'settings';

const navItems: { icon: typeof Home; label: string; route: Route }[] = [
  { icon: Home, label: 'Home', route: 'overview' },
  { icon: Map, label: 'Field Map', route: 'monitoring' },
  { icon: Leaf, label: 'Crop Analytics', route: 'crop-health' },
  { icon: BarChart2, label: 'Reports', route: 'reports' },
  { icon: Settings, label: 'Settings', route: 'settings' },
];

interface SidebarProps {
  activeRoute: Route;
  onNavigate: (route: Route) => void;
  onOpenAccount: () => void;
}

export default function Sidebar({ activeRoute, onNavigate, onOpenAccount }: SidebarProps) {
  const { user } = useAuth();
  const { theme, toggleTheme, isNight } = useTheme();

  const initials = (user?.name || 'Kiran Patel')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="fixed left-0 top-0 h-full w-16 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-cyan-500/20 flex flex-col items-center py-4 gap-2 z-30 shadow-sm transition-colors duration-300">
      {/* Brand mark */}
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 flex-shrink-0 transition-all ${
          isNight
            ? 'bg-gradient-to-br from-cyan-500 to-emerald-600 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
            : 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/20'
        }`}
      >
        <Leaf className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>

      {/* Nav items */}
      <div className="flex flex-col items-center gap-1.5 flex-1">
        {navItems.map(({ icon: Icon, label, route }) => {
          const isActive = activeRoute === route;
          return (
            <button
              key={route}
              id={`nav-${route}`}
              type="button"
              onClick={() => onNavigate(route)}
              className={`relative group w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isActive
                  ? isNight
                    ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-emerald-50 text-emerald-600 font-bold border border-emerald-200 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title={label}
            >
              {isActive && (
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full -ml-0.5 ${
                    isNight ? 'bg-cyan-400 shadow-[0_0_8px_#00f2fe]' : 'bg-emerald-500'
                  }`}
                />
              )}
              <Icon className="w-4.5 h-4.5" strokeWidth={isActive ? 2.5 : 2} />
              {/* Tooltip */}
              <span className="absolute left-14 bg-slate-900 dark:bg-slate-800 text-white text-xs px-2.5 py-1 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 border border-white/10 font-medium">
                {label}
                <ChevronRight className="w-3 h-3 inline ml-1 opacity-60" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Day / Night Theme Button in Sidebar */}
      <button
        type="button"
        onClick={toggleTheme}
        className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer mb-1 border border-slate-200/60 dark:border-cyan-500/20"
        title={theme === 'night' ? 'Day Mode' : 'Night Mode (Cyber/Neon)'}
      >
        {theme === 'night' ? (
          <Sun className="w-4 h-4 text-amber-300" />
        ) : (
          <Moon className="w-4 h-4 text-slate-600" />
        )}
      </button>

      {/* Avatar at bottom — opens account modal */}
      <button
        id="sidebar-account-btn"
        type="button"
        onClick={onOpenAccount}
        title="Account & Profile"
        className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-emerald-300 dark:border-cyan-500/40 hover:border-emerald-500 dark:hover:border-cyan-400 transition-all cursor-pointer shadow-sm"
      >
        <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center">
          <span className="text-white text-xs font-bold">{initials}</span>
        </div>
      </button>
    </aside>
  );
}
