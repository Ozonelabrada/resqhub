import React, { useState } from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  ShadcnSelect as Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem,
  Spinner 
} from '../../ui';
import { Megaphone } from 'lucide-react';
import { CommunityService } from '../../../services/communityService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  communityId?: string | undefined;
  onSuccess?: () => void;
}

const CreateAnnouncementModal: React.FC<Props> = ({ isOpen, onClose, communityId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'announcement'|'news'>('announcement');

  const handleSubmit = async () => {
    if (!communityId) return;
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await CommunityService.createPost(communityId, { 
        title, 
        description: content, 
        reportType: type === 'announcement' ? 'Announcement' : 'News' 
      });
      setTitle('');
      setContent('');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create announcement', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader>
        <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
          <Megaphone className="text-teal-600" size={24} />
        </div>
        <h2 className="text-xl font-black text-slate-900">Create Announcement / News</h2>
        <p className="text-slate-500 font-medium text-sm mt-1">Post important announcements or news to the community.</p>
      </ModalHeader>

      <ModalBody className="space-y-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Type</label>
          <Select onValueChange={(v) => setType(v as 'announcement'|'news')}>
            <SelectTrigger className="h-12 rounded-xl border-slate-200 mt-2 bg-slate-50 border-none">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl p-2 bg-white">
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="news">News</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-2 p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 font-medium h-12 px-4 shadow-sm" placeholder="Short headline" />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} className="w-full mt-2 p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 font-medium shadow-sm resize-none" placeholder="Write your announcement here..." />
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} className="font-bold text-slate-500">Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading || !title.trim() || !content.trim()} className="bg-teal-600 hover:bg-teal-700 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-teal-100">
          {loading ? <Spinner size="sm" className="mr-2" /> : null}
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
export default CreateAnnouncementModal;
