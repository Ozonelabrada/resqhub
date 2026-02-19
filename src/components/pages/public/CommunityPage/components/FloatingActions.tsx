import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui';

interface FloatingActionsProps {
  communityId: string;
  communityName: string;
  isMember: boolean;
  isAdmin: boolean;
  onCreatePost: () => void;
  activeTab: string;
}

const FloatingActions: React.FC<FloatingActionsProps> = ({
  communityId,
  communityName,
  isMember,
  isAdmin,
  onCreatePost,
  activeTab,
}) => {
  return (
    <>
      {/* FOOTER CTA (Mobile) - Only on Feed tab */}
      {activeTab === 'feed' && (
        <div className="md:hidden sticky bottom-4 mx-4 mb-4 z-50">
          <Button
            onClick={onCreatePost}
            className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-xl flex items-center justify-center gap-2 text-lg font-bold transition-transform active:scale-95 border-none"
          >
            <Plus className="w-6 h-6 border-2 rounded-md" />
            Create Post
          </Button>
        </div>
      )}
    </>
  );
};

export default FloatingActions;
