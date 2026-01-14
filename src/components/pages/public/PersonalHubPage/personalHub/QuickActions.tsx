import React from 'react';
import { Card, Button } from '@/components/ui';
import { Plus, Map, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
        <Button 
            onClick={() => navigate('/hub?action=create')}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-3xl py-8 h-auto font-black shadow-xl shadow-teal-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
            <Plus className="mr-3" size={24} /> Create New Report
        </Button>

        <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={() => navigate('/hub')} 
                className="p-5 bg-orange-50 rounded-4xl flex flex-col items-center gap-2 hover:bg-orange-100 transition-all group"
            >
                <ShieldCheck className="text-orange-500 group-hover:scale-110 transition-transform" size={24} />
                <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest">Safety Feed</span>
            </button>
            <button 
                onClick={() => navigate('/communities')} 
                className="p-5 bg-blue-50 rounded-4xl flex flex-col items-center gap-2 hover:bg-blue-100 transition-all group"
            >
                <Map className="text-blue-500 group-hover:scale-110 transition-transform" size={24} />
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Local Hubs</span>
            </button>
        </div>
    </div>
  );
};
