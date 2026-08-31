import { Bell, Moon, Sun } from 'lucide-react';
import type { Route } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const TAB_ROUTES: { label: string; route: Route }[] = [
  { label: 'Overview', route: 'overview' },
  { label: 'Monitoring', route: 'monitoring' },
  { label: 'Crop Health', route: 'crop-health' },
  { label: 'Reports', route: 'reports' },
];

interface HeaderProps {
  activeRoute: Route;
  onNavigate: (route: Route) => void;
  onOpenAccount: () => void;
}

export default function Header({ activeRoute, onNavigate, onOpenAccount }: HeaderProps) {
  const { user } = useAuth();
  const { theme, toggleTheme, isNight } = useTheme();

  const userName = user?.name || 'Kiran Patel';
  const userRole = user?.role || 'Agronomist';
  const initials = userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed top-0 left-16 right-0 h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-cyan-500/20 flex items-center px-5 gap-4 z-20 transition-colors duration-300">
      {/* Brand */}
      <div className="flex items-center gap-2 min-w-max">
        <div className="flex flex-col leading-none">
          <span
            className={`text-[11px] font-extrabold tracking-widest uppercase ${
              isNight ? 'neon-text-cyan' : 'text-emerald-600'
            }`}
          >
            AgriVision
          </span>
          <span className="text-[9px] text-slate-400 dark:text-slate-400 tracking-widest uppercase">
            ACCELCORP
          </span>
        </div>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />
      </div>

      {/* Centre pill nav */}
      <nav className="flex-1 flex justify-center">
        <div className="flex items-center bg-slate-100 dark:bg-slate-950/80 rounded-full p-1 gap-0.5 border border-slate-200/50 dark:border-cyan-500/20">
          {TAB_ROUTES.map(({ label, route }) => (
            <button
              key={route}
              id={`header-tab-${route}`}
              onClick={() => onNavigate(route)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeRoute === route
                  ? isNight
                    ? 'bg-slate-800 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] border border-cyan-500/40 font-bold'
                    : 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-2.5 min-w-max">
        {/* Dual-Theme Toggle Button */}
        <button
          id="theme-toggle-btn"
          type="button"
          onClick={toggleTheme}
          title={theme === 'night' ? 'Switch to Day Mode (Clean SaaS)' : 'Switch to Night Mode (Cyber/Neon)'}
          className="relative group w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-cyan-500/30 dark:shadow-[0_0_12px_rgba(6,182,212,0.2)]"
        >
          {theme === 'night' ? (
            <Sun className="w-4 h-4 text-amber-300 transition-transform rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 transition-transform rotate-0 hover:-rotate-12" />
          )}
          <span className="absolute top-11 right-0 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-white/10">
            {theme === 'night' ? 'Day Mode' : 'Night Mode (Cyber/Neon)'}
          </span>
        </button>

        {/* Notifications */}
        <button
          id="header-bell"
          type="button"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* User profile dropdown button — opens functional account modal */}
        <button
          id="header-user"
          type="button"
          onClick={onOpenAccount}
          className="flex items-center gap-2 rounded-2xl pr-3 pl-1.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-cyan-500/20 transition-colors cursor-pointer"
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-sm">
            <span className="text-white text-[11px] font-bold">{initials}</span>
          </div>
          <div className="leading-none text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{userName}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">{userRole}</p>
          </div>
        </button>
      </div>
    </header>
  );
}
