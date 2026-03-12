import { Message } from 'primereact/message';
import { useUserAnnouncements } from '@/hooks/useAnnouncements';
import { Announcement } from '@/types/admin';
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

  const severityMap: Record<string, 'success' | 'info' | 'warn' | 'error'> = {
    low: 'info',
    medium: 'info',
    high: 'warn',
  };

  const iconMap: Record<string, string> = {
    info: 'pi pi-info-circle',
    warning: 'pi pi-exclamation-circle',
    success: 'pi pi-check-circle',
    error: 'pi pi-times-circle',
    bell: 'pi pi-bell',
    star: 'pi pi-star',
  };

  return (
    <div className="announcement-banner-container">
      <Message
        severity={severityMap[announcement.priority] || 'info'}
        text={
          <div className="announcement-message-content">
            <div className="announcement-title">{announcement.title}</div>
            <div className="announcement-description">{announcement.message}</div>
          </div>
        }
        className="announcement-message w-full"
        icon={iconMap[announcement.iconType] || 'pi pi-info-circle'}
      />
    </div>
  );
}
