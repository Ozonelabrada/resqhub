import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  Avatar,
  Button
} from '../ui';
import { 
  CheckCircle, 
  MapPin, 
  Phone, 
  Calendar,
  ShieldCheck,
  MessageCircle,
  Mail,
  Heart,
  Award,
  Clock,
  Flag,
  Users,
  X,
  Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useFetchUserProfile } from '@/hooks/useFetchUserProfile';

interface ProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageClick?: (user: any) => void;
  userId?: string; // API endpoint will be called with this
  user?: {
    fullName: string;
    username: string;
    profilePicture?: string;
    isVerified?: boolean;
    location?: string;
    contactNumber?: string;
    joinDate?: string;
    email?: string;
    address?: string;
    sex?: string;
    age?: number;
    isSeller?: boolean;
    role?: string;
    memberSince?: number;
    reportCount?: number;
    verificationStatus?: string;
    trustScore?: number;
  } | null;
}

export const ProfilePreviewModal: React.FC<ProfilePreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  onMessageClick,
  userId,
  user: propUser
}) => {
  const { t } = useTranslation();
  const { userData: apiUser, loading, error } = useFetchUserProfile(isOpen && userId ? userId : null);
  const [localUser, setLocalUser] = useState(propUser);

  // Update local user when API data arrives
  useEffect(() => {
    if (apiUser) {
      // Calculate age only if available, otherwise use undefined
      let age: number | undefined;
      // BackendUserData doesn't have dateOfBirth, so we skip age calculation
      
      setLocalUser({
        fullName: apiUser.fullName ?? apiUser.name ?? '',
        username: apiUser.username ?? apiUser.email?.split('@')[0] ?? '',
        profilePicture: apiUser.profilePicture ?? undefined,
        email: apiUser.email ?? undefined,
        location: apiUser.location ?? undefined,
        contactNumber: undefined,
        joinDate: apiUser.joinDate ? new Date(apiUser.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
        sex: undefined,
        age,
        verificationStatus: apiUser.emailVerified ? 'Verified' : 'Unverified',
        memberSince: apiUser.joinDate ? Math.floor((Date.now() - new Date(apiUser.joinDate).getTime()) / (1000 * 60 * 60 * 24)) : undefined
      });
    } else if (propUser) {
      // Use prop user if no API data
      setLocalUser(propUser);
    }
  }, [apiUser, propUser]);

  const user = localUser;

  if (!isOpen) return null;
  if (!user && loading) return null; // Don't render until we have data or know we're not loading

  const getVerificationColor = (status?: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'verified') return 'bg-emerald-50 border-emerald-200';
    if (statusLower === 'pending') return 'bg-amber-50 border-amber-200';
    if (statusLower === 'unverified') return 'bg-slate-50 border-slate-200';
    return 'bg-slate-50 border-slate-200';
  };

  const getTrustColor = (score?: number) => {
    if (!score) return 'text-slate-400';
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-y-auto max-h-[95vh] outline-none">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
            <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Loading Profile...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
            <X className="w-12 h-12 text-rose-600" />
            <p className="text-sm font-black text-slate-900 uppercase tracking-widest text-center">Failed to Load Profile</p>
            <p className="text-xs text-slate-500 text-center">{error}</p>
            <Button onClick={onClose} className="mt-4 bg-slate-900 hover:bg-slate-800 text-white">Close</Button>
          </div>
        )}

        {/* Content State */}
        {!loading && !error && user && (
          <>
        {/* Decorative Header Background */}
        <div className="relative h-40 bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
        </div>
        
        <div className="px-8 pb-10 -mt-20 relative">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-200 to-emerald-200 rounded-2xl opacity-0 hover:opacity-100 blur-xl transition-opacity" />
              <Avatar 
                src={user.profilePicture} 
                alt={user.fullName}
                className="relative w-32 h-32 border-4 border-white shadow-xl"
              />
              {user.isVerified && (
                <div className="absolute bottom-2 right-2 bg-emerald-500 rounded-full border-4 border-white p-1.5 shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Name & Username */}
            <div className="space-y-2 mb-6">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2 flex-wrap">
                {user.fullName}
                {user.isVerified && <ShieldCheck className="w-6 h-6 text-emerald-600" />}
              </h2>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">@{user.username}</p>
              
              {/* Role Badge */}
              {user.role && (
                <div className="inline-block">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                    user.role === 'admin' ? "bg-rose-100 text-rose-700" :
                    user.role === 'moderator' ? "bg-amber-100 text-amber-700" :
                    user.role === 'seller' ? "bg-teal-100 text-teal-700" :
                    "bg-slate-100 text-slate-700"
                  )}>
                    {user.role === 'admin' ? '👑 Admin' : user.role === 'moderator' ? '⚡ Moderator' : user.role === 'seller' ? '🛍️ Seller' : '👤 Member'}
                  </span>
                </div>
              )}
            </div>

            {/* Trust Score */}
            {user.trustScore !== undefined && (
              <div className="w-full mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    <Heart size={16} className={getTrustColor(user.trustScore)} />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Trust</p>
                    <p className={cn("text-xs font-bold", getTrustColor(user.trustScore))}>{user.trustScore}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 w-full gap-3 mb-6">


              {/* Address (profile primary location) */}
              {user.location && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-orange-500">
                    <MapPin size={16} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Address</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{user.location}</p>
                  </div>
                </div>
              )}

              {/* Full address */}
              {user.address && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600">
                    <MapPin size={16} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Address</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{user.address}</p>
                  </div>
                </div>
              )}

              {/* Contact Number */}
              {user.contactNumber && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-emerald-600">
                    <Phone size={16} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Phone</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{user.contactNumber}</p>
                  </div>
                </div>
              )}

              {/* Email */}
              {user.email && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600">
                    <Mail size={16} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Email</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Demographics Section */}
              <div className="grid grid-cols-3 gap-3">
                {/* Age */}
                {user.age && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-purple-600">
                      <Users size={14} />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Age</p>
                      <p className="text-xs font-bold text-slate-700">{user.age}</p>
                    </div>
                  </div>
                )}

                {/* Gender */}
                {user.sex && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-pink-200 hover:bg-pink-50/30 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-pink-600">
                      <Users size={14} />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Gender</p>
                      <p className="text-xs font-bold text-slate-700 capitalize">{user.sex}</p>
                    </div>
                  </div>
                )}

                {/* Member Since */}
                {user.memberSince !== undefined && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-teal-600">
                      <Clock size={14} />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Days</p>
                      <p className="text-xs font-bold text-slate-700">{user.memberSince}d</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Join Date & Activity */}
              <div className="grid grid-cols-2 gap-3">
                {/* Joined Date */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-teal-600">
                    <Calendar size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Joined</p>
                    <p className="text-xs font-bold text-slate-700">{user.joinDate || 'Jan 2024'}</p>
                  </div>
                </div>

                {/* Verification Status - Below Joined Date */}
                <div className={cn("flex items-center gap-3 p-3 rounded-xl border", getVerificationColor(user.verificationStatus))}>
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600">
                    <Flag size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
                    <p className="text-xs font-bold text-slate-700 capitalize">{user.verificationStatus || 'Unverified'}</p>
                  </div>
                </div>
              </div>

              {/* Activity Count - Moved to new row since Status moved up */}
              {user.reportCount !== undefined && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-amber-600">
                    <Award size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Activity</p>
                    <p className="text-xs font-bold text-slate-700">{user.reportCount} reports</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full pt-4 border-t border-slate-100">
              <Button 
                variant="outline"
                className="border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 rounded-xl h-11 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 w-full"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
