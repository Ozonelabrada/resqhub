import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  Button,
  ShadcnSelect as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from '../../ui';
import { UserPlus, Mail, X } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityName: string;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, communityName }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com' },
  ];

  const handleInvite = async () => {
    setLoading(true);
    try {
      // API call to invite users
      console.log('Inviting users to', communityName, ':', selectedUsers);
      await new Promise(resolve => setTimeout(resolve, 1000));
      onClose();
    } catch (error) {
      console.error('Failed to invite users:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(id => id !== userId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-none shadow-2xl rounded-[2rem] p-8 bg-white">
        <DialogHeader>
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
            <UserPlus className="text-orange-600" size={24} />
          </div>
          <DialogTitle className="text-xl font-black text-slate-900">{t('community.invite') || 'Invite'} to {communityName}</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            {t('community.invite_description')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('community.select_members') || 'Select members'}</label>
            <Select onValueChange={(v) => {
              if (!selectedUsers.includes(v)) setSelectedUsers([...selectedUsers, v]);
            }}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200">
                <SelectValue placeholder={t('community.search_placeholder') || 'Search users...'} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl p-2 bg-white">
                {mockUsers.map(user => (
                  <SelectItem key={user.id} value={user.id} className="py-2 px-3 rounded-lg focus:bg-teal-50">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{user.name}</span>
                      <span className="text-xs text-slate-500">{user.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {selectedUsers.map(userId => {
              const user = mockUsers.find(u => u.id === userId);
              return (
                <Badge key={userId} variant="secondary" className="pl-3 pr-1 py-1 rounded-lg bg-teal-50 text-teal-700 border-teal-100 flex items-center gap-1 font-bold">
                  {user?.name}
                  <button onClick={() => removeUser(userId)} className="p-1 hover:bg-teal-100 rounded-md">
                    <X size={12} />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} className="font-bold text-slate-400">{t('common.cancel')}</Button>
          <Button 
            disabled={loading || selectedUsers.length === 0}
            onClick={handleInvite}
            className="bg-teal-600 hover:bg-teal-700 text-white font-black px-8 h-12 rounded-xl shadow-lg"
          >
            {loading ? t('common.loading') : t('community.send_invites')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteModal;
