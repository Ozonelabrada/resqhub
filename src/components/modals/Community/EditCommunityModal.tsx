import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  ShadcnSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Textarea,
  Button,
  Spinner
} from '../../ui';
import { AdminService } from '@/services/adminService';
import { CommunityService } from '@/services/communityService';
import type { CommunityDetail } from '@/types/admin';
import type { Community } from '@/types/community';

interface EditCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: CommunityDetail | null;
  onSuccess?: (updatedCommunity: CommunityDetail) => void;
}

const EditCommunityModal: React.FC<EditCommunityModalProps> = ({ 
  isOpen, 
  onClose, 
  community, 
  onSuccess 
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [fetchingCommunities, setFetchingCommunities] = useState(false);
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  
  const [formData, setFormData] = useState<Partial<CommunityDetail>>({
    name: '',
    description: '',
    location: '',
    parentId: null,
    settings: {
      visibility: 'public',
      joinPolicy: 'open',
      moderationPolicy: 'normal'
    }
  });

  useEffect(() => {
    if (isOpen && community) {
      setFormData({
        name: community.name,
        description: community.description,
        location: community.location || '',
        parentId: community.parentId || null,
        settings: {
          visibility: community.settings?.visibility || 'public',
          joinPolicy: community.settings?.joinPolicy || 'open',
          moderationPolicy: community.settings?.moderationPolicy || 'normal'
        }
      });
      fetchCommunities();
    }
  }, [isOpen, community]);

  const fetchCommunities = async () => {
    setFetchingCommunities(true);
    try {
      const data = await CommunityService.getCommunities();
      // Filter out current community to prevent self-parenting
      setAllCommunities(data.filter(c => String(c.id) !== String(community?.id)));
    } catch (error) {
      console.error('Error fetching communities for dropdown:', error);
    } finally {
      setFetchingCommunities(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'parentId') {
      setFormData(prev => ({ 
        ...prev, 
        parentId: value === 'none' ? null : value 
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings!,
          [name]: value
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!community?.id) return;

    setLoading(true);
    try {
      const response = await AdminService.updateCommunity(community.id, formData);
      if (response.succeeded) {
        if (onSuccess) {
          // Find the name of the parent community if it changed for local state update
          let parentName = community.parentCommunityName;
          if (formData.parentId !== community.parentId) {
            const parent = allCommunities.find(c => String(c.id) === String(formData.parentId));
            parentName = parent ? parent.name : null;
          }
          onSuccess({ 
            ...community, 
            ...formData, 
            parentCommunityName: parentName 
          } as CommunityDetail);
        }
        onClose();
      }
    } catch (error) {
      console.error('Error updating community:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!community) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white max-h-[90vh] flex flex-col">
        <DialogHeader className="px-8 pt-8 pb-4 text-left bg-white relative z-10">
          <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
            Edit Community Details
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
              Community Name
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter community name"
              required
              className="bg-slate-50 border-none rounded-xl font-bold py-6 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
              Description
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What is this community about?"
              required
              className="bg-slate-50 border-none rounded-xl font-bold min-h-[100px] focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                Parent Community
              </label>
              <Select 
                value={formData.parentId ? String(formData.parentId) : 'none'} 
                onValueChange={(val) => handleSelectChange('parentId', val)}
                disabled={fetchingCommunities}
              >
                <SelectTrigger className="bg-slate-50 border-none rounded-xl font-bold h-12 focus:ring-2 focus:ring-teal-500/20 transition-all">
                  <SelectValue placeholder="Select Parent (Optional)" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl z-[400]">
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {allCommunities.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                Location
              </label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, Region or Area"
                className="bg-slate-50 border-none rounded-xl font-bold py-6 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                Visibility
              </label>
              <Select 
                value={formData.settings?.visibility} 
                onValueChange={(val) => handleSelectChange('visibility', val)}
              >
                <SelectTrigger className="bg-slate-50 border-none rounded-xl font-bold h-12 focus:ring-2 focus:ring-teal-500/20 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl z-[400]">
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                Join Policy
              </label>
              <Select 
                value={formData.settings?.joinPolicy} 
                onValueChange={(val) => handleSelectChange('joinPolicy', val)}
              >
                <SelectTrigger className="bg-slate-50 border-none rounded-xl font-bold h-12 focus:ring-2 focus:ring-teal-500/20 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl z-[400]">
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="approval_required">Approval Required</SelectItem>
                  <SelectItem value="invite_only">Invite Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                Moderation
              </label>
              <Select 
                value={formData.settings?.moderationPolicy} 
                onValueChange={(val) => handleSelectChange('moderationPolicy', val)}
              >
                <SelectTrigger className="bg-slate-50 border-none rounded-xl font-bold h-12 focus:ring-2 focus:ring-teal-500/20 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl z-[400]">
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="strict">Strict</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4 gap-3 bg-white border-t border-slate-50 mt-auto">
            <Button
              type="submit"
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl px-8 shadow-lg shadow-teal-100 transition-all"
            >
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCommunityModal;
