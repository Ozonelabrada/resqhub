import React, { useState, useMemo, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  Button,
  Avatar,
  Spinner,
  ShadcnBadge as Badge
} from '@/components/ui';
import { 
  Search, 
  UserPlus, 
  Check, 
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommunityService } from '@/services/communityService';
import type { CommunityMember } from '@/types/community';

interface AddVolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string | number;
  existingVolunteers: CommunityMember[];
  onAddVolunteer: (members: CommunityMember[]) => Promise<void>;
  isLoading?: boolean;
}

export const AddVolunteerModal: React.FC<AddVolunteerModalProps> = ({ 
  isOpen, 
  onClose, 
  communityId,
  existingVolunteers,
  onAddVolunteer,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchedMembers, setFetchedMembers] = useState<CommunityMember[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // Fetch members from API when modal opens
  useEffect(() => {
    if (isOpen && communityId) {
      const fetchMembers = async () => {
        setIsFetching(true);
        try {
          const members = await CommunityService.getCommunityMembers(String(communityId));
          setFetchedMembers(members);
        } catch (error) {
          console.error('Error fetching members:', error);
          setFetchedMembers([]);
        } finally {
          setIsFetching(false);
        }
      };
      fetchMembers();
    }
  }, [isOpen, communityId]);

  // Filter members: exclude admins, moderators, and existing volunteers
  const availableMembers = useMemo(() => {
    const existingVolunteerIds = new Set(existingVolunteers.map(v => v.id));
    
    return fetchedMembers.filter(member => {
      // Exclude admins and moderators
      if (member.role === 'admin' || member.role === 'moderator') return false;
      // Exclude already volunteers
      if (existingVolunteerIds.has(member.id)) return false;
      // Match search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          member.name.toLowerCase().includes(query) ||
          member.username.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [fetchedMembers, existingVolunteers, searchQuery]);

  const handleSelectMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleAddVolunteers = async () => {
    if (selectedMembers.size === 0) return;

    setIsSubmitting(true);
    try {
      const selectedMembersList = availableMembers.filter(m => selectedMembers.has(m.id));
      
      // Pass all selected members to callback
      await onAddVolunteer(selectedMembersList);

      // Clear selection and close
      setSelectedMembers(new Set());
      setSearchQuery('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedMembers(new Set());
    setSearchQuery('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-gradient-to-br from-purple-50 to-violet-50 border-b border-purple-100">
          <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white">
              <UserPlus size={20} />
            </div>
            Add Volunteers
          </DialogTitle>
          <DialogDescription className="text-slate-600 font-medium mt-2">
            Select members from your community to become volunteers. (Admins and moderators are excluded)
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6 max-h-[500px] overflow-y-auto">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search members by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isFetching}
              className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all font-bold text-slate-700 disabled:opacity-50"
            />
          </div>

          {/* Members List */}
          {isFetching || isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Spinner className="w-8 h-8 text-purple-600" />
              <p className="text-sm font-bold text-slate-500">Loading members...</p>
            </div>
          ) : availableMembers.length > 0 ? (
            <div className="space-y-3">
              {availableMembers.map((member) => {
                const isSelected = selectedMembers.has(member.id);
                const joinedDate = new Date(member.joinedAt);
                const memberSince = Math.floor((new Date().getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={member.id}
                    onClick={() => handleSelectMember(member.id)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group",
                      isSelected
                        ? "bg-purple-50 border-purple-400 shadow-md shadow-purple-100"
                        : "bg-white border-slate-100 hover:border-purple-200 hover:bg-purple-50/20"
                    )}
                  >
                    {/* Checkbox */}
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all border-2",
                      isSelected
                        ? "bg-purple-600 border-purple-600"
                        : "bg-white border-slate-300 group-hover:border-purple-400"
                    )}>
                      {isSelected && <Check size={16} className="text-white" strokeWidth={3} />}
                    </div>

                    {/* Avatar */}
                    <Avatar 
                      src={member.profilePicture}
                      alt={member.name}
                      className="w-12 h-12 rounded-xl border-2 border-white shadow-sm flex-shrink-0"
                    />

                    {/* Member Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm truncate">
                          {member.name}
                        </h4>
                        {member.isSeller && (
                          <Badge className="bg-teal-100 text-teal-700 border-none font-black text-[8px] uppercase tracking-widest px-1.5 py-0 flex-shrink-0">
                            Seller
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-400 font-mono truncate">@{member.username}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-1">
                        Member for {memberSince === 0 ? 'New' : memberSince === 1 ? '1 day' : `${memberSince} days`}
                      </p>
                    </div>

                    {/* Role Badge */}
                    <Badge className={cn(
                      "border-none font-black text-[9px] uppercase tracking-widest px-2 py-1 flex-shrink-0",
                      member.role === 'member' ? "bg-slate-100 text-slate-700" : "bg-slate-200 text-slate-600"
                    )}>
                      {member.role === 'member' ? '👤 Member' : member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
                <UserPlus size={32} />
              </div>
              <h4 className="font-black text-slate-700 text-sm mb-1">No Available Members</h4>
              <p className="text-xs text-slate-500 font-medium">
                {searchQuery.trim() 
                  ? 'No members match your search criteria' 
                  : 'All eligible members are already volunteers'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between sm:justify-end gap-4">
          <div className="mr-auto text-sm font-bold text-slate-600">
            {selectedMembers.size > 0 && (
              <span className="text-purple-600">
                {selectedMembers.size} member{selectedMembers.size !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          
          <Button 
            variant="outline"
            onClick={handleClose}
            className="border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded-xl px-6 py-2 h-auto font-black text-[10px] uppercase tracking-widest transition-all"
            disabled={isSubmitting}
          >
            <X size={16} className="mr-2" />
            Cancel
          </Button>
          
          <Button 
            onClick={handleAddVolunteers}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8 py-2 h-auto font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-200 transition-all disabled:opacity-60 flex items-center gap-2"
            disabled={selectedMembers.size === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Add as Volunteer{selectedMembers.size !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVolunteerModal;
