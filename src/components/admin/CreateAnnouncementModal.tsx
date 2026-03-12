import { useState } from 'react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { CreateAnnouncementRequest, AnnouncementAudience } from '@/types/admin';
import { Button, Input, Textarea } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui';
import toast from 'react-hot-toast';

interface CreateAnnouncementModalProps {
  visible: boolean;
  onHide: () => void;
}

const AUDIENCE_OPTIONS: Array<{ label: string; value: AnnouncementAudience }> = [
  { label: 'All Users Globally', value: 'all' },
  { label: 'Global Admins', value: 'admins' },
  { label: 'Global Moderators', value: 'moderators' },
  { label: 'All Riders', value: 'riders' },
  { label: 'All Sellers', value: 'sellers' },
  { label: 'Community Admins', value: 'community_admins' },
  { label: 'Community Moderators', value: 'community_moderators' },
];

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const ICON_OPTIONS = [
  { label: 'ℹ️ Info', value: 'info' },
  { label: '⚠️ Warning', value: 'warning' },
  { label: '✅ Success', value: 'success' },
  { label: '❌ Error', value: 'error' },
  { label: '🔔 Bell', value: 'bell' },
  { label: '⭐ Star', value: 'star' },
];

export function CreateAnnouncementModal({ visible, onHide }: CreateAnnouncementModalProps) {
  const { createAnnouncement, loading } = useAnnouncements();

  const [formData, setFormData] = useState<CreateAnnouncementRequest>({
    title: '',
    message: '',
    targetAudience: 'all',
    priority: 'medium',
    iconType: 'info',
  });

  const [communityId, setCommunityId] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Message is required');
      return;
    }

    // Community-specific announcements require communityId
    if (
      (formData.targetAudience === 'community_admins' || formData.targetAudience === 'community_moderators') &&
      !communityId
    ) {
      toast.error('Community ID is required for community-specific announcements');
      return;
    }

    try {
      const submitData: CreateAnnouncementRequest = {
        ...formData,
        communityId: communityId ? Number(communityId) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      };

      await createAnnouncement(submitData);
      toast.success('Announcement created successfully');

      // Reset form
      setFormData({
        title: '',
        message: '',
        targetAudience: 'all',
        priority: 'medium',
        iconType: 'info',
      });
      setCommunityId('');
      setExpiresAt('');
      onHide();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create announcement');
    }
  };

  if (!visible) return null;

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onHide()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Announcement</DialogTitle>
          <DialogDescription>
            Create and send announcements to specific user audiences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter announcement title"
              maxLength={100}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100</p>
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium">
              Message <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Announcement message"
              maxLength={1000}
              rows={4}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.message.length}/1000</p>
          </div>

          {/* Target Audience */}
          <div>
            <label className="text-sm font-medium">Target Audience</label>
            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as AnnouncementAudience })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
            >
              {AUDIENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Community ID */}
          {(formData.targetAudience === 'community_admins' || formData.targetAudience === 'community_moderators') && (
            <div>
              <label className="text-sm font-medium">
                Community ID <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={communityId}
                onChange={(e) => setCommunityId(e.target.value)}
                placeholder="Enter community ID"
                className="mt-1"
              />
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="text-sm font-medium">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Icon Type */}
          <div>
            <label className="text-sm font-medium">Icon</label>
            <select
              value={formData.iconType}
              onChange={(e) => setFormData({ ...formData, iconType: e.target.value as any })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
            >
              {ICON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Expiration Date */}
          <div>
            <label className="text-sm font-medium">Expiration Date (Optional)</label>
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onHide}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Announcement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
