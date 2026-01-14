import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Card, 
  Button, 
  Logo,
  ProgressBar 
} from '../../ui';
import { SITE } from '../../../constants';
import { 
  Wrench, 
  Settings, 
  Home, 
  RefreshCw,
  Clock,
  ShieldCheck
} from 'lucide-react';

const UnderMaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  // Progress animation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + Math.random() * 5;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8">
      <Container size="sm">
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-6" />
        </div>

        <Card className="p-8 md:p-12 border-none shadow-2xl shadow-slate-200 rounded-[3rem] bg-white text-center relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-teal-50 mb-8 relative">
              <Wrench className="w-10 h-10 text-teal-600 animate-bounce" />
              <Settings className="w-6 h-6 text-emerald-400 absolute -top-1 -right-1 animate-spin-slow" />
            </div>

            <h1 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">System Maintenance</h1>
            <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto leading-relaxed">
              We're currently performing some scheduled updates to improve your experience. We'll be back online shortly.
            </p>

            <div className="space-y-6 mb-12">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Update Progress</span>
                <span className="text-2xl font-black text-teal-600">{Math.round(progress)}%</span>
              </div>
              <ProgressBar 
                value={progress} 
                className="h-4 rounded-full bg-slate-100"
                color="bg-teal-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                <div className="flex items-center gap-3 mb-1">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Time</span>
                </div>
                <p className="text-slate-700 font-bold">~ 15 Minutes</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                <div className="flex items-center gap-3 mb-1">
                  <RefreshCw className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
                </div>
                <p className="text-slate-700 font-bold">Optimizing Assets</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-100 font-bold"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-8 py-6 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-600 font-bold"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Check Status
              </Button>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300">
            <ShieldCheck className="w-4 h-4" />
            {SITE.name} Infrastructure
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default UnderMaintenancePage;