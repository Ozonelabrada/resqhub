import React, { useState } from 'react';
import { Card, Button, Avatar, ShadcnBadge as Badge, Modal } from '@/components/ui';
import { 
  BookOpen, 
  Phone, 
  FileText, 
  MapPin, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  ArrowUpRight,
  LifeBuoy,
  FileSearch,
  Users,
  Plus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'Legal' | 'Health' | 'Safety' | 'General';
  type: 'Document' | 'Contact' | 'Link';
  value: string; // Phone number, filename, or URL
}

const SAMPLE_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Village Emergency Hotlines',
    description: 'Direct numbers for Local Fire, Police, and Medical response teams.',
    category: 'Safety',
    type: 'Contact',
    value: '911 / 888-0000'
  },
  {
    id: '2',
    title: 'HOA Bylaws & Guidelines',
    description: 'Updated 2025 version of residency rules and community standards.',
    category: 'Legal',
    type: 'Document',
    value: 'community_bylaws_2025.pdf'
  },
  {
    id: '3',
    title: 'Disaster Map & Evacuation',
    description: 'Interactive map showing high-ground areas and designated assembly points.',
    category: 'Safety',
    type: 'Link',
    value: 'https://maps.example.com/evac'
  },
  {
    id: '4',
    title: 'Waste Management Schedule',
    description: 'Weekly schedule for garbage, recycling, and bulk item collection.',
    category: 'General',
    type: 'Document',
    value: 'collection_schedule.pdf'
  },
  {
    id: '5',
    title: 'Barangay Health Center',
    description: 'Available Mon-Fri 8AM-5PM for basic checkups and vaccinations.',
    category: 'Health',
    type: 'Contact',
    value: '0917-000-0000'
  }
];

export const CommunityResources: React.FC<{
  isAdmin?: boolean;
  onOpenAddResourceModal?: () => void;
  communityId?: string;
}> = ({ isAdmin = false, onOpenAddResourceModal, communityId }) => {
  const [localIsModalOpen, setLocalIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General' as 'Legal' | 'Health' | 'Safety' | 'General',
    type: 'Link' as 'Document' | 'Contact' | 'Link',
    value: ''
  });
  const getCategoryColor = (cat: Resource['category']) => {
    switch (cat) {
      case 'Safety': return 'text-orange-600 bg-orange-50';
      case 'Health': return 'text-emerald-600 bg-emerald-50';
      case 'Legal': return 'text-purple-600 bg-purple-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getIcon = (type: Resource['type']) => {
    switch (type) {
      case 'Contact': return <Phone size={20} />;
      case 'Document': return <FileText size={20} />;
      case 'Link': return <ExternalLink size={20} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-200">
                <BookOpen size={24} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">
                Resource <span className="text-teal-600">Hub</span>
              </h2>
            </div>
            <p className="text-slate-500 font-medium max-w-lg">
              Essential documents, emergency contacts, and community guidelines all in one place.
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setLocalIsModalOpen(true)}
              disabled
              className="h-14 px-8 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl flex items-center gap-2 shadow-xl shadow-teal-200/50 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Resource
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SAMPLE_RESOURCES.map((resource) => (
          <Card key={resource.id} className="p-8 border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] bg-white group">
            <div className="flex flex-col h-full space-y-6">
              <div className="flex justify-between items-start">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm", getCategoryColor(resource.category))}>
                  {getIcon(resource.type)}
                </div>
                <Badge variant="outline" className="px-3 py-1 uppercase text-[10px] font-black tracking-widest border-slate-100 text-slate-400">
                  {resource.category}
                </Badge>
              </div>

              <div className="space-y-2 flex-grow">
                <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-teal-600 transition-colors">
                  {resource.title}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  {resource.description}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 font-mono tracking-tight">
                  {resource.type === 'Contact' ? resource.value : resource.type === 'Document' ? resource.value.split('.')[1].toUpperCase() : 'URL'}
                </span>
                
                <Button
                disabled
                 className="h-10 px-6 bg-slate-900 hover:bg-teal-600 text-white font-black rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2">
                  {resource.type === 'Contact' ? 'CALL NOW' : resource.type === 'Document' ? 'DOWNLOAD' : 'VISIT SITE'}
                  <ArrowUpRight size={14} className="stroke-[3px]" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Suggestion Section */}
      <Card className="p-10 border-none shadow-sm rounded-[3rem] bg-teal-600 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-2">
            <LifeBuoy size={32} />
          </div>
          <h4 className="text-2xl font-black uppercase italic">Missing Something?</h4>
          <p className="text-teal-50 font-medium max-w-md">
            If there's a community document or contact that should be here, let the administration know.
          </p>
          <Button disabled className="bg-white text-teal-600 font-black rounded-xl px-10 h-12 hover:bg-teal-50 uppercase tracking-widest text-[11px] mt-4">
            Contact Admin
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
      </Card>

      {/* Add Resource Modal */}
      {localIsModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Add Resource</h2>
                <p className="text-sm text-slate-500 mt-1">Add a new document, contact, or link to the community resource hub</p>
              </div>
              <button
                onClick={() => setLocalIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-black text-slate-600 uppercase tracking-tight mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none font-medium"
                  placeholder="e.g., Emergency Hotlines"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-black text-slate-600 uppercase tracking-tight mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none font-medium resize-none"
                  rows={3}
                  placeholder="Describe what this resource is about"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-black text-slate-600 uppercase tracking-tight mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none font-medium"
                >
                  <option>General</option>
                  <option>Safety</option>
                  <option>Health</option>
                  <option>Legal</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-black text-slate-600 uppercase tracking-tight mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none font-medium"
                >
                  <option>Contact</option>
                  <option>Document</option>
                  <option>Link</option>
                </select>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-black text-slate-600 uppercase tracking-tight mb-2">
                  {formData.type === 'Contact' ? 'Phone Number' : formData.type === 'Document' ? 'Filename' : 'URL'}
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none font-medium"
                  placeholder={formData.type === 'Contact' ? '911 / 888-0000' : formData.type === 'Document' ? 'document.pdf' : 'https://example.com'}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-gray-100 p-6 flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setLocalIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-black"
                onClick={() => {
                  // Handle resource submission
                  console.log('Submitting resource:', formData);
                  setLocalIsModalOpen(false);
                  setFormData({ title: '', description: '', category: 'General', type: 'Link', value: '' });
                }}
              >
                Add Resource
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};