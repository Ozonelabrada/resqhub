import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui';

interface RestrictedContentProps {
  title: string;
  description: string;
  onJoinClick: () => void;
}

const RestrictedContent: React.FC<RestrictedContentProps> = ({ title, description, onJoinClick }) => (
  <div className="p-20 text-center flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
    <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mb-6 text-teal-600">
      <Lock size={40} />
    </div>
    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">{title}</h3>
    <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">{description}</p>
    <Button
      onClick={onJoinClick}
      className="px-10 h-14 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl shadow-xl shadow-teal-100 uppercase tracking-widest text-xs"
    >
      Join to Unlock
    </Button>
  </div>
);

export default RestrictedContent;
