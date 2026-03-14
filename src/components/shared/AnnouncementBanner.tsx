import { useUserAnnouncements } from '@/hooks/useAnnouncements';
import { Announcement } from '@/types/admin';
import { AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import './AnnouncementBanner.css';

export function AnnouncementBanner() {
  const { announcements, loading } = useUserAnnouncements();

  if (loading || announcements.length === 0) {
    return null;
  }

  // Show the latest high-priority announcement
  const announcement = announcements.find((a) => a.priority === 'high') || announcements[0];

  if (!announcement) {
    return null;
  }

  const severityConfig: Record<string, { bg: string; border: string; icon: any; textColor: string }> = {
    low: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Info, textColor: 'text-blue-900' },
    medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertTriangle, textColor: 'text-yellow-900' },
    high: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle, textColor: 'text-red-900' },
  };

  const config = severityConfig[announcement.priority] || severityConfig['low'];
  const Icon = config.icon;

  return (
    <div className="announcement-banner-container">
      <div className={`${config.bg} border ${config.border} rounded-lg p-4 flex items-start gap-3 w-full`}>
        <Icon className={`${config.textColor} flex-shrink-0 mt-0.5`} size={20} />
        <div className={`flex-1 ${config.textColor}`}>
          <div className="announcement-title font-semibold">{announcement.title}</div>
          <div className="announcement-description text-sm mt-1">{announcement.message}</div>
        </div>
      </div>
    </div>
  );
}
