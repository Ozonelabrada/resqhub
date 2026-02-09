import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  Avatar,
  Button
} from '../ui';
import { 
  MapPin, 
  Users,
  Baby,
  X
} from 'lucide-react';

interface ReportProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    fullName?: string;
    profilePicture?: string;
    profilePictureUrl?: string;
    address?: string;
    sex?: string;
    age?: number;
  } | null;
}

export const ReportProfileModal: React.FC<ReportProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  user 
}) => {
  if (!user) return null;

  const profilePicUrl = user.profilePicture || user.profilePictureUrl;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-y-auto max-h-[90vh] outline-none">
        {/* Decorative Header Background */}
        <div className="h-32 bg-gradient-to-br from-teal-500 to-emerald-600 relative">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22><rect fill=%22%23000%22 width=%2220%22 height=%2220%22/><path fill=%22%23fff%22 d=%22M0 0h10v10H0zm10 10h10v10H10z%22/></svg>')" }}></div>
          
          {/* Close button in top right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-8 pb-8">
          {/* Profile Picture - Centered and overlapping header */}
          <div className="flex justify-center -mt-16 mb-8">
            <div className="relative">
              <Avatar 
                src={profilePicUrl}
                alt={user.fullName || 'User'}
                className="w-32 h-32 border-4 border-white shadow-lg"
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900">
              {user.fullName || 'Unknown User'}
            </h2>
          </div>

          {/* Info Cards */}
          <div className="space-y-4 mb-8">
            {/* Age */}
            {user.age && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-100 hover:bg-teal-50/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-500">
                  <Baby size={24} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Age</p>
                  <p className="font-bold text-slate-700 text-base">{user.age} years</p>
                </div>
              </div>
            )}

            {/* Sex/Gender */}
            {user.sex && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-100 hover:bg-teal-50/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-purple-500">
                  <Users size={24} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Gender</p>
                  <p className="font-bold text-slate-700 text-base capitalize">{user.sex}</p>
                </div>
              </div>
            )}

            {/* Address */}
            {user.address && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-100 hover:bg-teal-50/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-orange-500">
                  <MapPin size={24} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Address</p>
                  <p className="font-bold text-slate-700 text-base">{user.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black h-12 rounded-xl uppercase text-xs tracking-widest transition-all"
          >
            Close Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportProfileModal;
