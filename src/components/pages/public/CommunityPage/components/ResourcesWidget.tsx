import React from 'react';
import { Card, Button } from '@/components/ui';
import { 
  FileText, 
  ExternalLink, 
  Download, 
  ShieldCheck, 
  Phone,
  BookOpen
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  type: 'Guide' | 'Contact' | 'Document' | 'Link';
  description: string;
}

const MOCK_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Emergency Response Guide',
    type: 'Guide',
    description: 'A step-by-step PDF on what to do during local emergencies.'
  },
  {
    id: '2',
    title: 'Local Shelter Contact List',
    type: 'Contact',
    description: 'Verified contact numbers for all shelters in the district.'
  },
  {
    id: '3',
    title: 'Community Shared Drive',
    type: 'Link',
    description: 'Folder containing all community meeting minutes and bylaws.'
  }
];

export const ResourcesWidget: React.FC = () => {
  return (
    <Card className="p-8 border-none shadow-sm rounded-[2.5rem] bg-white text-slate-900 overflow-hidden relative">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Community Resources</h4>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
        </div>

        <div className="space-y-4">
          {MOCK_RESOURCES.map((resource) => (
            <div 
              key={resource.id} 
              className="p-5 rounded-2xl bg-slate-50 border border-slate-50 hover:border-teal-100 transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  {resource.type === 'Guide' && <BookOpen size={18} />}
                  {resource.type === 'Contact' && <Phone size={18} />}
                  {resource.type === 'Document' && <FileText size={18} />}
                  {resource.type === 'Link' && <ExternalLink size={18} />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{resource.type}</span>
                  </div>
                  <h5 className="font-black text-slate-800 text-sm leading-tight text-balance group-hover:text-teal-600 transition-colors">
                    {resource.title}
                  </h5>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {resource.description}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-teal-600 flex items-center gap-1.5 transition-colors">
                  <Download size={14} />
                  Access Resource
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <div className="bg-teal-50/50 rounded-2xl p-6 border border-teal-50">
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="text-teal-600" size={20} />
              <span className="text-xs font-black text-teal-900 uppercase tracking-widest">Verified Tools</span>
            </div>
            <p className="text-[11px] text-teal-700/70 font-medium leading-relaxed mb-6">
              All resources provided here are verified by community moderators and regional admins.
            </p>
            <Button className="w-full bg-white text-teal-600 hover:bg-teal-100 border-none shadow-sm rounded-xl h-10 text-[10px] font-black uppercase tracking-widest">
              View Dashboard
            </Button>
          </div>
        </div>
      </div>
      
      {/* Decorative Blur */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-50 rounded-full blur-3xl opacity-50"></div>
    </Card>
  );
};
