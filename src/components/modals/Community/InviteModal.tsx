import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  Button,
  Badge,
  Spinner
} from '../../ui';
import { UserPlus, Mail, X, Search, Check } from 'lucide-react';
import { UserService, type BackendUserData } from '../../../services/userService';
import { CommunityService } from '../../../services/communityService';
import { cn } from '@/lib/utils';
import { SITE } from '@/constants/site';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityName: string;
  communityId?: string;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, communityName, communityId }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BackendUserData[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<BackendUserData[]>([]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setSearching(true);
        try {
          const results = await UserService.searchUsers(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const toggleUser = (user: BackendUserData) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleInvite = async () => {
    if (!communityId) return;
    setLoading(true);
    try {
      const userIds = selectedUsers.map(u => u.id);
      await CommunityService.inviteMembers(communityId, userIds);
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error('Failed to invite users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-[2.5rem] p-8 bg-white">
        <DialogHeader>
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
            <UserPlus className="text-orange-600" size={24} />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900">Invite Members</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Search for people in {SITE.name} to join {communityName}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-3">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-700 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searching && <Spinner size="sm" className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-600" />}
             </div>
          </div>

          <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
             {searchResults.length > 0 ? (
               <div className="space-y-2">
                  {searchResults.map(user => (
                    <button 
                      key={user.id} 
                      onClick={() => toggleUser(user)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-2xl border transition-all",
                        selectedUsers.find(u => u.id === user.id) 
                          ? "bg-teal-50 border-teal-100 ring-1 ring-teal-100" 
                          : "bg-white border-transparent hover:bg-slate-50"
                      )}
                    >
                       <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0">
                          {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-slate-400">
                               {user.fullName?.charAt(0)}
                            </div>
                          )}
                       </div>
                       <div className="flex-1 text-left">
                          <p className="font-black text-slate-900 text-sm leading-tight">{user.fullName}</p>
                          <p className="text-[10px] font-bold text-slate-400 truncate">@{user.username}</p>
                       </div>
                       {selectedUsers.find(u => u.id === user.id) && (
                         <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white">
                            <Check size={14} strokeWidth={3} />
                         </div>
                       )}
                    </button>
                  ))}
               </div>
             ) : searchQuery.length > 2 && !searching ? (
               <div className="text-center py-8">
                  <p className="text-slate-400 font-bold text-sm">No users found for "{searchQuery}"</p>
               </div>
             ) : null}
          </div>

          {selectedUsers.length > 0 && (
            <div className="pt-4 border-t border-slate-50">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Selected {selectedUsers.length}</label>
               <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <Badge key={user.id} className="bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-100 flex items-center gap-1.5 py-1.5 pl-2 pr-1 rounded-xl font-bold transition-all">
                       <span className="max-w-[80px] truncate">{user.fullName}</span>
                       <button onClick={() => toggleUser(user)} className="p-0.5 rounded-md hover:bg-teal-200/50 text-teal-400 transition-colors">
                          <X size={12} />
                       </button>
                    </Badge>
                  ))}
               </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose} className="font-bold text-slate-400 rounded-xl h-12">Cancel</Button>
          <Button 
            disabled={loading || selectedUsers.length === 0}
            onClick={handleInvite}
            className="bg-teal-600 hover:bg-teal-700 text-white font-black px-10 h-12 rounded-xl shadow-xl shadow-teal-100 transition-all active:scale-95"
          >
            {loading ? <Spinner size="sm" className="mr-2" /> : <UserPlus size={18} className="mr-2" />}
            Send Invitations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteModal;
