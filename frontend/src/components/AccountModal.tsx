import { useState, useEffect } from 'react';
import {
  X,
  User,
  Lock,
  Building2,
  Mail,
  ChevronRight,
  LogOut,
  AlertTriangle,
  Pencil,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Farm {
  id: string;
  name: string;
  location: string;
  acres: number;
}

const MOCK_FARMS: Farm[] = [
  { id: 'f1', name: 'Patel Agro Estate', location: 'Ludhiana, Punjab', acres: 128 },
  { id: 'f2', name: 'Green Valley Farm', location: 'Amritsar, Punjab', acres: 240 },
  { id: 'f3', name: 'Sunrise Organics', location: 'Coimbatore, Tamil Nadu', acres: 85 },
];

export default function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const { user, updateProfile, logout } = useAuth();

  const [panel, setPanel] = useState<'profile' | 'password' | 'farms' | 'logout-confirm'>('profile');
  const [editing, setEditing] = useState(false);

  const [draft, setDraft] = useState({
    name: user?.name || 'Kiran Patel',
    role: user?.role || 'Chief Agronomist',
    farm: user?.farm || 'Patel Agro Estate',
    email: user?.email || 'kiran.patel@gmail.com',
  });

  useEffect(() => {
    if (user) {
      setDraft({
        name: user.name,
        role: user.role,
        farm: user.farm,
        email: user.email,
      });
    }
  }, [user]);

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaved, setPwSaved] = useState(false);
  const [activeFarm, setActiveFarm] = useState('f1');

  const initials = (user?.name || draft.name)
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const saveProfile = () => {
    updateProfile(draft);
    setEditing(false);
  };

  const savePassword = () => {
    if (pwForm.next && pwForm.next === pwForm.confirm) {
      setPwSaved(true);
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setPwSaved(false), 2500);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 transition-opacity duration-300"
        />
      )}

      {/* Drawer */}
      <div
        id="account-modal"
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col transition-all duration-300 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-emerald-50 to-white dark:from-slate-800/80 dark:to-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Account & Profile</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Avatar */}
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-800 dark:text-white truncate">
                {user?.name || draft.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.role || draft.role} · {user?.farm || draft.farm}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate mt-0.5">
                {user?.email || draft.email}
              </p>
            </div>
          </div>

          {/* Sub-nav pills */}
          <div className="flex gap-1.5 mt-4">
            {(['profile', 'password', 'farms'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPanel(p)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  panel === p
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p === 'profile' ? '👤 Profile' : p === 'password' ? '🔒 Password' : '🌾 Farms'}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Profile Panel */}
          {panel === 'profile' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Profile Details
                </p>
                {!editing ? (
                  <button
                    onClick={() => {
                      setDraft({
                        name: user?.name || '',
                        role: user?.role || '',
                        farm: user?.farm || '',
                        email: user?.email || '',
                      });
                      setEditing(true);
                    }}
                    className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                ) : (
                  <button
                    onClick={saveProfile}
                    className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    <Check className="w-3 h-3" /> Save
                  </button>
                )}
              </div>

              {[
                { icon: User, label: 'Full Name', field: 'name' as const },
                { icon: Building2, label: 'Role', field: 'role' as const },
                { icon: Building2, label: 'Assigned Farm', field: 'farm' as const },
                { icon: Mail, label: 'Email', field: 'email' as const },
              ].map(({ icon: Icon, label, field }) => (
                <div key={field} className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Icon className="w-3 h-3" /> {label}
                  </label>
                  {editing ? (
                    <input
                      value={draft[field]}
                      onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50 dark:bg-slate-800/80 transition"
                    />
                  ) : (
                    <p className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-sm font-semibold text-slate-800 dark:text-white border border-slate-100 dark:border-slate-800">
                      {user?.[field] || draft[field]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Password Panel */}
          {panel === 'password' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Security & Password
              </p>
              {[
                { label: 'Current Password', field: 'current' as const },
                { label: 'New Password', field: 'next' as const },
                { label: 'Confirm New Password', field: 'confirm' as const },
              ].map(({ label, field }) => (
                <div key={field} className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {label}
                  </label>
                  <input
                    type="password"
                    value={pwForm[field]}
                    onChange={(e) => setPwForm((f) => ({ ...f, [field]: e.target.value }))}
                    placeholder="••••••••"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50 dark:bg-slate-800/80 transition"
                  />
                </div>
              ))}
              {pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm && (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Passwords do not match
                </p>
              )}
              <button
                onClick={savePassword}
                disabled={!pwForm.current || !pwForm.next || pwForm.next !== pwForm.confirm}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {pwSaved ? '✓ Password Updated' : 'Update Password'}
              </button>
            </div>
          )}

          {/* Farms Panel */}
          {panel === 'farms' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Switch Farm / Add Account
              </p>
              {MOCK_FARMS.map((farm) => (
                <button
                  key={farm.id}
                  onClick={() => {
                    setActiveFarm(farm.id);
                    updateProfile({ farm: farm.name });
                  }}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeFarm === farm.id
                      ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activeFarm === farm.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-bold truncate ${
                        activeFarm === farm.id
                          ? 'text-emerald-900 dark:text-emerald-200'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {farm.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {farm.location} · {farm.acres} acres
                    </p>
                  </div>
                  {activeFarm === farm.id && (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Logout confirm */}
          {panel === 'logout-confirm' && (
            <div className="flex flex-col items-center gap-4 pt-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/60 flex items-center justify-center border border-red-200 dark:border-red-800">
                <LogOut className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-800 dark:text-white">
                  Sign out of AgriVision?
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  You will need to sign in again to access the active farm telemetry workspace.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  type="button"
                  onClick={() => setPanel('profile')}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition shadow-md shadow-red-500/20 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setPanel('logout-confirm')}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-100 dark:border-red-900/50 text-sm font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
            <ChevronRight className="w-3.5 h-3.5 ml-auto" />
          </button>
        </div>
      </div>
    </>
  );
}
