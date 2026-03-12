import React, { useState } from 'react';
import { AnnouncementsManagement } from '@/components/admin/AnnouncementsManagement';
import { CreateAnnouncementModal } from '@/components/admin/CreateAnnouncementModal';
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';

const AnnouncementsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Announcements</h1>
          <p className="text-slate-600 mt-1">Create and manage announcements for different user audiences</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="gap-2"
        >
          <Plus size={18} />
          Create Announcement
        </Button>
      </div>

      <AnnouncementsManagement />
      <CreateAnnouncementModal 
        visible={isModalOpen}
        onHide={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default AnnouncementsPage;
