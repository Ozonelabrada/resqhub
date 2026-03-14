import { useState, useEffect } from 'react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { Announcement, AnnouncementAudience } from '@/types/admin';
import { Button } from '@/components/ui';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import './AnnouncementsManagement.css';

// Helper function to format relative time
const formatRelativeTime = (date: string | Date | undefined): string => {
  if (!date) return 'Unknown date';
  
  try {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    
    return then.toLocaleDateString();
  } catch {
    return 'Invalid date';
  }
};

const AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
  all: 'All Users',
  admins: 'Global Admins',
  moderators: 'Global Moderators',
  riders: 'Riders',
  sellers: 'Sellers',
  community_admins: 'Community Admins',
  community_moderators: 'Community Moderators',
};

const ICON_MAP: Record<string, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  success: '✅',
  error: '❌',
  bell: '🔔',
  star: '⭐',
};

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export function AnnouncementsManagement() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { announcements, loading, error, deleteAnnouncement, refetch } = useAnnouncements();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleDelete = async (announcement: Announcement) => {
    if (!window.confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
      return;
    }

    try {
      await deleteAnnouncement(announcement.id);
      toast.success('Announcement deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete announcement');
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    try {
      return new Date(expiresAt) < new Date();
    } catch {
      return false;
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading announcements: {error}</p>
        <Button onClick={() => refetch()} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading announcements...</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">All Announcements</h2>

        {announcements.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No announcements yet</p>
        ) : (
          <div className="space-y-2">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="border border-slate-200 rounded-lg overflow-hidden">
                {/* Expandable Header */}
                <div className="bg-slate-50 p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100"
                  onClick={() => setExpandedId(expandedId === announcement.id ? null : announcement.id)}>
                  
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{ICON_MAP[announcement.iconType || 'info'] || '📢'}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900">{announcement.title || 'Untitled'}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${PRIORITY_STYLES[announcement.priority] || PRIORITY_STYLES['low']}`}>
                          {(announcement.priority || 'low').toUpperCase()}
                        </span>
                        {isExpired(announcement.expiresAt) && (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-800 rounded">EXPIRED</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-1">{announcement.message || ''}</p>
                    </div>
                  </div>

                  {expandedId === announcement.id ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  )}
                </div>

                {/* Expanded Content */}
                {expandedId === announcement.id && (
                  <div className="bg-white p-4 border-t border-slate-200 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Message</label>
                      <p className="text-slate-900 whitespace-pre-wrap">{announcement.message || 'No message'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600">Audience</label>
                        <p className="text-slate-900">{AUDIENCE_LABELS[announcement.targetAudience as AnnouncementAudience] || announcement.targetAudience || 'Unknown'}</p>
                        {announcement.communityId && (
                          <p className="text-sm text-slate-600">Community ID: {announcement.communityId}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-600">Created By</label>
                        <p className="text-slate-900">{announcement.createdBy?.name || 'System'}</p>
                        <p className="text-sm text-slate-600">{formatRelativeTime(announcement.createdAt)}</p>
                      </div>
                    </div>

                    {announcement.expiresAt && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">Expires</label>
                        <p className="text-slate-900">
                          {isExpired(announcement.expiresAt) ? 'Expired' : formatRelativeTime(announcement.expiresAt)}
                        </p>
                      </div>
                    )}

                    {announcement.updatedAt && announcement.updatedAt !== announcement.createdAt && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">Last Updated</label>
                        <p className="text-sm text-slate-600">{formatRelativeTime(announcement.updatedAt)}</p>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                      <Button
                        color="destructive"
                        size="sm"
                        onClick={() => handleDelete(announcement)}
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
