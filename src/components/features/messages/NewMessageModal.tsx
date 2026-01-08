import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  User as UserIcon,
  ArrowRight,
  CheckCircle,
  Users
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { ScrollArea } from '../../ui/scroll-area';
import { Spinner } from '../../ui/spinner';
import { UserService } from '@/services/userService';
import type { BackendUserData } from '@/services/userService';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: BackendUserData) => void;
}

export const NewMessageModal: React.FC<NewMessageModalProps> = ({
  isOpen,
  onClose,
  onSelectUser
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<BackendUserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BackendUserData | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await UserService.searchUsers(searchQuery);
        setUsers(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStartChat = () => {
    if (selectedUser) {
      onSelectUser(selectedUser);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-white animate-in zoom-in-95 duration-300">
        <DialogHeader className="p-8 pb-0 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
              New Message
            </DialogTitle>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Select a recipient</p>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-gray-50 text-slate-400">
              <X className="w-5 h-5" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-teal-500 transition-colors" />
            <Input 
              placeholder="Search by name or @username..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-14 bg-slate-50 border-none rounded-2xl text-base font-medium focus-visible:ring-teal-500/20 shadow-inner"
            />
          </div>

          <div className="flex gap-2">
             <Button variant="outline" className="flex-1 rounded-2xl h-12 border-slate-100 bg-white hover:bg-teal-50 hover:text-teal-600 hover:border-teal-100 transition-all font-black text-xs uppercase tracking-widest gap-2">
                <UserIcon className="w-4 h-4" />
                Direct
             </Button>
             <Button variant="outline" className="flex-1 rounded-2xl h-12 border-slate-100 bg-gray-50/50 text-slate-400 cursor-not-allowed font-black text-xs uppercase tracking-widest gap-2">
                <Users className="w-4 h-4" />
                Community
             </Button>
          </div>

          <ScrollArea className="h-64 pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Spinner size="lg" className="text-teal-500" />
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all border-2",
                      selectedUser?.id === user.id 
                        ? "bg-teal-50 border-teal-200" 
                        : "bg-white border-transparent hover:bg-gray-50"
                    )}
                  >
                    <Avatar 
                      src={user.profilePicture} 
                      className="w-12 h-12 border-2 border-white shadow-sm"
                    />
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900 text-sm leading-none mb-1">{user.fullName}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">@{user.username}</p>
                    </div>
                    {selectedUser?.id === user.id ? (
                      <CheckCircle className="w-6 h-6 text-teal-600 fill-teal-50" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-100" />
                    )}
                  </div>
                ))}
              </div>
            ) : searchQuery && !isLoading ? (
              <div className="text-center py-12">
                <p className="text-slate-400 font-bold italic">No one found with that name.</p>
              </div>
            ) : (
              <div className="text-center py-12 opacity-30">
                <UserIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-400 font-bold">Search results will appear here</p>
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl font-black text-slate-500"
          >
            Cancel
          </Button>
          <Button 
            disabled={!selectedUser}
            onClick={handleStartChat}
            className="flex-[2] h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-widest shadow-xl shadow-teal-100 gap-2 overflow-hidden group"
          >
            <span>Start Chat</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
