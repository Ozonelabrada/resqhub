import React, { useState } from 'react';
import { 
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
  TabList,
  TabTrigger,
  TabContent,
  Spinner
} from '../../ui';
import { 
  Megaphone, 
  Newspaper, 
  MessageSquare, 
  AlertCircle,
  Plus,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { CommunityService } from '../../../services/communityService';
import { cn } from '@/lib/utils';

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  onSuccess?: () => void;
  isAdmin?: boolean;
  defaultType?: ContentType;
  allowedTypes?: ContentType[];
}

type ContentType = 'lost' | 'found' | 'discussion' | 'announcement' | 'news';

const CreateContentModal: React.FC<CreateContentModalProps> = ({ 
  isOpen, 
  onClose, 
  communityId, 
  onSuccess, 
  isAdmin,
  defaultType = 'lost',
  allowedTypes
}) => {
  const [activeTab, setActiveTab] = React.useState<ContentType>(defaultType);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: '',
    content: '',
    image: null as File | null
  });

  // Update active tab when defaultType changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      // If default type is not in allowed types, pick first allowed or default to 'lost'
      if (allowedTypes && !allowedTypes.includes(defaultType)) {
        setActiveTab(allowedTypes[0] || 'lost');
      } else {
        setActiveTab(defaultType);
      }
    }
  }, [isOpen, defaultType, allowedTypes]);

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    setLoading(true);
    try {
      await CommunityService.createPost(communityId, {
        title: formData.title,
        content: formData.content,
        type: activeTab as any
      });
      setFormData({ title: '', content: '', image: null });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create content:', error);
    } finally {
      setLoading(false);
    }
  };

  const allTabs = [
    { value: 'lost', label: 'Lost Item', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { value: 'found', label: 'Found Item', icon: AlertCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { value: 'discussion', label: 'Discussion', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
    ...(isAdmin ? [
      { value: 'announcement', label: 'Announcement', icon: Megaphone, color: 'text-teal-600', bg: 'bg-teal-50' },
      { value: 'news', label: 'News', icon: Newspaper, color: 'text-amber-600', bg: 'bg-amber-50' }
    ] : [])
  ];

  const tabs = allowedTypes 
    ? allTabs.filter(t => allowedTypes.includes(t.value as ContentType))
    : allTabs;

  const currentTabInfo = allTabs.find(t => t.value === activeTab);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
         <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors", currentTabInfo?.bg)}>
            {currentTabInfo && <currentTabInfo.icon className={currentTabInfo.color} size={24} />}
         </div>
         <h2 className="text-2xl font-black text-slate-900">
           {activeTab === 'news' || activeTab === 'announcement' ? 'Publish Update' : 'Create New Content'}
         </h2>
         <p className="text-slate-500 font-medium text-sm mt-1">
           {activeTab === 'news' ? 'Post news and stories to the community feed.' : 
            activeTab === 'announcement' ? 'Broadcast important information to all members.' :
            'Share updates, report items, or start discussions with your community.'}
         </p>
      </ModalHeader>

      <ModalBody className="p-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContentType)} className="w-full mt-2">
           {tabs.length > 1 && (
             <div className="px-8 border-b border-slate-50 overflow-x-auto no-scrollbar">
                <TabList className="flex gap-4 bg-transparent border-none p-0 h-auto">
                   {tabs.map(tab => (
                     <TabTrigger 
                       key={tab.value} 
                       value={tab.value}
                       className={cn(
                         "flex items-center gap-2 pb-4 pt-1 px-1 bg-transparent border-none shadow-none text-[10px] font-black uppercase tracking-widest transition-all relative data-[state=active]:bg-transparent data-[state=active]:shadow-none whitespace-nowrap",
                         activeTab === tab.value ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                       )}
                     >
                       {tab.label}
                       {activeTab === tab.value && <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-600 rounded-full" />}
                     </TabTrigger>
                   ))}
                </TabList>
             </div>
           )}

           <div className="p-8 space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   {activeTab === 'news' || activeTab === 'announcement' ? 'Headline' : 'Title'}
                 </label>
                 <input 
                   className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-700 placeholder:text-slate-300" 
                   placeholder={activeTab === 'lost' ? "e.g. Lost: Black Wallet at Starbucks" : activeTab === 'found' ? "e.g. Found: Keys near Central Park" : "Give your post a clear headline..."}
                   value={formData.title}
                   onChange={e => setFormData({...formData, title: e.target.value})}
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   {activeTab === 'news' || activeTab === 'announcement' ? 'Full Content' : 'Description'}
                 </label>
                 <textarea 
                   className="w-full p-4 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-700 placeholder:text-slate-300 resize-none" 
                   rows={5}
                   placeholder={activeTab === 'lost' || activeTab === 'found' ? "Describe the item, location, and date..." : "Write the details here..."}
                   value={formData.content}
                   onChange={e => setFormData({...formData, content: e.target.value})}
                 />
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-slate-100 transition-all">
                 <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <ImageIcon className="text-slate-400" size={20} />
                 </div>
                 <p className="text-xs font-bold text-slate-600">Add {activeTab === 'news' ? 'Article Photo' : 'Image'}</p>
                 <p className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG supported</p>
              </div>
           </div>
        </Tabs>
      </ModalBody>

      <ModalFooter>
         <Button variant="ghost" onClick={onClose} className="font-bold text-slate-400 rounded-xl h-12 px-6">
            Cancel
         </Button>
         <Button 
           onClick={handleSubmit} 
           disabled={loading || !formData.title.trim() || !formData.content.trim()}
           className="bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl h-12 px-10 shadow-xl shadow-teal-100 transition-all active:scale-95"
         >
            {loading ? <Spinner size="sm" className="mr-2" /> : <Plus size={18} className="mr-2" />}
            {activeTab === 'news' || activeTab === 'announcement' ? 'Publish' : `Create ${currentTabInfo?.label}`}
         </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CreateContentModal;
