import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { useUserAnnouncements } from '@/hooks/useAnnouncements';
import { Announcement } from '@/types/admin';
import { formatDistanceToNow } from 'date-fns';
import './AnnouncementList.css';

export function AnnouncementList() {
  const { announcements, loading, error } = useUserAnnouncements();
  const [expandedRows, setExpandedRows] = useState<any>(null);

  const priorityBadgeTemplate = (rowData: Announcement) => {
    const severityMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
      low: 'info',
      medium: 'warning',
      high: 'danger',
    };
    return (
      <Badge value={rowData.priority.toUpperCase()} severity={severityMap[rowData.priority]} />
    );
  };

  const dateTemplate = (rowData: Announcement) => {
    try {
      return formatDistanceToNow(new Date(rowData.createdAt), { addSuffix: true });
    } catch {
      return rowData.createdAt;
    }
  };

  const expandedRowTemplate = (rowData: Announcement) => {
    return (
      <div className="announcement-details-container">
        <div className="announcement-content">
          <h4>Message</h4>
          <p className="announcement-full-content">{rowData.message}</p>
          {rowData.expiresAt && (
            <p className="announcement-expiry">
              <strong>Expires:</strong> {new Date(rowData.expiresAt).toLocaleString()}
            </p>
          )}
          {rowData.createdBy && (
            <p className="announcement-creator">
              <strong>From:</strong> {rowData.createdBy.name}
            </p>
          )}
          {rowData.communityId && (
            <p className="announcement-community">
              <strong>Community ID:</strong> {rowData.communityId}
            </p>
          )}
        </div>
      </div>
    );
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
        <Badge value={announcements.length.toString()} severity="success" />
      </div>
      <DataTable
        value={announcements}
        loading={loading}
        expandedRows={expandedRows}
        onExpandedRowsChange={(e) => setExpandedRows(e.value)}
        rowExpansionTemplate={expandedRowTemplate}
        dataKey="id"
        className="announcements-datatable"
        emptyMessage="No announcements found"
        responsiveLayout="scroll"
      >
        <Column expander style={{ width: '3rem' }} />
        <Column
          field="title"
          header="Title"
          body={(rowData: Announcement) => (
            <div className="announcement-cell">
              <strong>{rowData.title}</strong>
            </div>
          )}
        />
        <Column
          field="priority"
          header="Priority"
          body={priorityBadgeTemplate}
          style={{ width: '100px' }}
        />
        <Column
          field="createdAt"
          header="Posted"
          body={dateTemplate}
          style={{ width: '120px' }}
        />
      </DataTable>
    </Card>
  );
}
