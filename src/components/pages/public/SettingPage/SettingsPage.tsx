import React from 'react';
import { 
  Settings, 
  User, 
  Database, 
  RefreshCw, 
  Shield, 
  Bell, 
  ChevronRight 
} from 'lucide-react';
import { 
  Card, 
  Button, 
  Container, 
  StatusBadge 
} from '../../../ui';
import { useAuth } from '../../../../context/AuthContext';
import { useFeatureFlags } from '@/hooks';
import { Flag, ToggleLeft, ToggleRight } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { userData: user } = useAuth() ?? {};
  const { flags, toggleFlag } = useFeatureFlags();

  const handleMigrate = () => {
    alert('Migration started! (This is a placeholder. Implement your migration logic here.)');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pt-32 pb-20">
      <Container size="md">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 rounded-3xl bg-teal-600 flex items-center justify-center text-white shadow-xl shadow-teal-200">
            <Settings size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Settings</h1>
            <p className="text-slate-500 font-medium">Manage your account and system preferences</p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Account Section */}
          <Card className="p-8 border-none shadow-xl rounded-[2.5rem] bg-white">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
                <User size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Account</h2>
            </div>
            
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current User</span>
                <span className="text-lg font-bold text-slate-900">{user?.email || user?.name || 'Not signed in'}</span>
              </div>
              <StatusBadge status={user ? 'active' : 'inactive'} />
            </div>
          </Card>

          {/* Migrations Section */}
          <Card className="p-8 border-none shadow-xl rounded-[2.5rem] bg-white">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Database size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">System Migrations</h2>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <p className="text-slate-600 leading-relaxed">
                  Run database or data migrations and manage advanced configurations. 
                  This action will synchronize your local data with the latest schema.
                </p>
              </div>
              <Button
                variant="warning"
                className="rounded-2xl px-8 py-4 h-auto font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-lg shadow-amber-100"
                onClick={handleMigrate}
              >
                <RefreshCw size={18} />
                Run Migration
              </Button>
            </div>
          </Card>

          {/* Feature Flags Section */}
          <Card className="p-8 border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center text-white">
                <Flag size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black">Feature Flags (Admin)</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Dynamic UI Management</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(flags).map((flag) => (
                <div 
                  key={flag} 
                  className="flex items-center justify-between p-6 bg-slate-800/50 rounded-3xl border border-slate-700/50 hover:border-teal-500/50 transition-colors cursor-pointer group"
                  onClick={() => toggleFlag(flag as any)}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-black capitalize tracking-tight group-hover:text-teal-400 transition-colors">
                      {flag.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">
                      {flags[flag] ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  {flags[flag] ? (
                    <ToggleRight className="text-teal-400 w-8 h-8" />
                  ) : (
                    <ToggleLeft className="text-slate-600 w-8 h-8" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4">
              <Shield className="text-amber-500 w-5 h-5 mt-0.5" />
              <p className="text-amber-200/80 text-xs leading-relaxed">
                <span className="font-bold text-amber-500">Caution:</span> Toggling these flags will immediately change the UI behavior for the current session and be saved to local storage.
              </p>
            </div>
          </Card>

          {/* Placeholder Sections */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-none shadow-xl rounded-[2.5rem] bg-white group cursor-pointer hover:bg-slate-900 transition-colors duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                  <Shield size={24} />
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 group-hover:text-white mb-2">Security</h3>
              <p className="text-slate-500 group-hover:text-slate-400 text-sm">Manage your password and 2FA settings</p>
            </Card>

            <Card className="p-8 border-none shadow-xl rounded-[2.5rem] bg-white group cursor-pointer hover:bg-slate-900 transition-colors duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Bell size={24} />
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 group-hover:text-white mb-2">Notifications</h3>
              <p className="text-slate-500 group-hover:text-slate-400 text-sm">Configure how you receive alerts</p>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SettingsPage;