import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  Avatar,
  Button
} from '../ui';
import { 
  CheckCircle, 
  MapPin, 
  Phone, 
  Calendar,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageClick?: (user: any) => void;
  user: {
    fullName: string;
    username: string;
    profilePicture?: string;
    isVerified?: boolean;
    location?: string;
    contactNumber?: string;
    joinDate?: string;
  } | null;
}

export const ProfilePreviewModal: React.FC<ProfilePreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  onMessageClick,
  user 
}) => {
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-y-auto max-h-[90vh] outline-none">
        {/* Decorative Header Background */}
        <div className="h-32 bg-gradient-to-br from-teal-500 to-emerald-600 w-full" />
        
        <div className="px-8 pb-10 -mt-16 relative">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-6">
              <Avatar 
                src={user.profilePicture} 
                alt={user.fullName}
                className="w-32 h-32 border-4 border-white shadow-xl ring-1 ring-slate-100"
              />
              {user.isVerified && (
                <div className="absolute bottom-2 right-2 bg-emerald-500 rounded-full border-4 border-white p-1.5 shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Name & Username */}
            <div className="space-y-1 mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                {user.fullName}
                {user.isVerified && <ShieldCheck className="w-6 h-6 text-teal-600" />}
              </h2>
              <p className="text-slate-400 font-bold text-lg uppercase tracking-widest">@{user.username}</p>
            </div>

            {/* Info Grid ... */}
            <div className="grid grid-cols-1 w-full gap-4 mb-10">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-teal-100 hover:bg-teal-50/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-orange-500">
                  <MapPin size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">City / Location</p>
                  <p className="font-bold text-slate-700">{user.location || 'City not specified'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-emerald-100 hover:bg-emerald-50/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                  <Phone size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Contact Number</p>
                  <p className="font-bold text-slate-700">{user.contactNumber || 'Hidden for privacy'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-teal-100 hover:bg-teal-50/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-teal-600">
                  <Calendar size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Joined RescueHub</p>
                  <p className="font-bold text-slate-700">{user.joinDate || 'Jan 2024'}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button 
                onClick={() => onMessageClick?.(user)}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-14 font-black shadow-lg shadow-teal-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Message
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-slate-100 hover:border-teal-600 hover:text-teal-600 rounded-2xl h-14 font-black transition-all active:scale-95"
                onClick={onClose}
              >
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
