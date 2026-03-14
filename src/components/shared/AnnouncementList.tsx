import { useState } from 'react';
import { useUserAnnouncements } from '@/hooks/useAnnouncements';
import { Announcement } from '@/types/admin';
import './AnnouncementList.css';
import { Badge, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui';
import { formatDistanceToNow } from '@/utils/formatter';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function AnnouncementList() {
  const { announcements, loading, error } = useUserAnnouncements();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  if (error) {
    return (
      <Card className="announcement-error-card">
        <div className="error-message">
          <i className="pi pi-exclamation-circle"></i>
          <span>Failed to load announcements: {error}</span>
        </div>
      </Card>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card className="announcement-empty-card">
        <div className="empty-message">
          <i className="pi pi-inbox"></i>
          <span>No announcements at this time</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="announcements-list-card">
      <div className="announcements-header">
        <h3>📢 Announcements</h3>
        <Badge variant="success">{announcements.length}</Badge>
      </div>
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading announcements...</div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="announcements-datatable">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Posted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((announcement) => (
                <div key={announcement.id}>
                  <TableRow>
                    <TableCell>
                      <button
                        onClick={() => toggleExpanded(announcement.id)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        {expandedRows.has(announcement.id) ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="announcement-cell">
                        <strong>{announcement.title}</strong>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const variantMap: Record<string, 'info' | 'warning' | 'danger'> = {
                          low: 'info',
                          medium: 'warning',
                          high: 'danger',
                        };
                        return (
                          <Badge variant={variantMap[announcement.priority]}>
                            {announcement.priority.toUpperCase()}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        try {
                          return formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true });
                        } catch {
                          return announcement.createdAt;
                        }
                      })()}
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(announcement.id) && (
                    <TableRow className="bg-gray-50">
                      <TableCell colSpan={4}>
                        <div className="announcement-details-container p-4">
                          <div className="announcement-content">
                            <h4>Message</h4>
                            <p className="announcement-full-content">{announcement.message}</p>
                            {announcement.expiresAt && (
                              <p className="announcement-expiry">
                                <strong>Expires:</strong> {new Date(announcement.expiresAt).toLocaleString()}
                              </p>
                            )}
                            {announcement.createdBy && (
                              <p className="announcement-creator">
                                <strong>From:</strong> {announcement.createdBy.name}
                              </p>
                            )}
                            {announcement.communityId && (
                              <p className="announcement-community">
                                <strong>Community ID:</strong> {announcement.communityId}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </div>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
