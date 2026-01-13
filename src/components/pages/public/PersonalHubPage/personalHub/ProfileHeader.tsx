import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Avatar } from '../../../../ui';
import { Camera, MapPin, User as UserIcon, Edit3, Share2, MoreHorizontal, CheckCircle } from 'lucide-react';
import type { UserProfile } from '../../../../../types/personalHub';

interface ProfileHeaderProps {
  userData: UserProfile;
  onEditProfile: () => void;
  onProfilePictureUpload: (event: any) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userData,
  onEditProfile,
  onProfilePictureUpload,
}) => {
  const { t } = useTranslation();
  return (
    <div className="mb-0 overflow-hidden border-none bg-white">
      {/* Cover Photo Area - Balanced HERO UI */}
      <div
        className="relative h-48 md:h-64 lg:h-80 group bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700"
        style={{
          backgroundImage: userData.coverPhoto ? `url(${userData.coverPhoto})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl" />
        </div>

        <div className="absolute top-6 right-6 flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/10 backdrop-blur-md text-white hover:bg-white/30 border border-white/20 rounded-2xl px-4 h-10 font-bold"
          >
            <Camera size={18} className="mr-2" /> Change Cover
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/10 backdrop-blur-md text-white hover:bg-white/30 border border-white/20 rounded-2xl w-10 h-10 p-0"
          >
            <Share2 size={18} />
          </Button>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="px-10 md:px-10 lg:px-16 pb-8">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-8 -mt-16 md:-mt-20 relative z-10">
          {/* Profile Picture */}
          <div className="relative group">
            <div className="p-1.5 bg-white rounded-4xl shadow-xl">
              <Avatar
                src={userData.profilePicture}
                label={userData.fullName?.charAt(0) || userData.username.charAt(0)}
                className="w-32 h-32 md:w-44 md:h-44 border-4 border-white rounded-3xl object-cover"
              />
            </div>
            <button
              onClick={() => document.getElementById('profile-picture-upload')?.click()}
              className="absolute bottom-2 right-2 bg-teal-600 text-white p-2.5 rounded-xl shadow-lg hover:bg-teal-700 transition-all transform hover:scale-110 border-4 border-white"
            >
              <Camera size={16} />
            </button>
            <input
              id="profile-picture-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onProfilePictureUpload}
            />
          </div>

          {/* User Info */}
          <div className="flex-1 pb-2">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                    {userData.fullName || userData.username}
                  </h1>
                  {userData.id && (
                    <div className="bg-teal-500 text-white p-1 rounded-full shadow-lg shadow-teal-500/20">
                      <CheckCircle size={18} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-teal-600 font-extrabold text-lg">@{userData.username}</span>
                  <div className="h-1 w-1 bg-slate-300 rounded-full" />
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Community Member</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mt-6">
                  <div className="flex items-center gap-2 text-slate-600 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl text-sm font-bold shadow-sm">
                    <MapPin size={16} className="text-teal-500" />
                    {userData.location || t('common.global_citizen')}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl text-sm font-bold shadow-sm">
                    <UserIcon size={16} className="text-emerald-500" />
                    {t('common.joined')} {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                   onClick={onEditProfile}
                   className="rounded-2xl px-8 h-12 bg-slate-900 hover:bg-slate-800 text-white font-black shadow-xl transition-all hover:-translate-y-1"
                >
                  <Edit3 size={18} className="mr-2" /> Edit Profile
                </Button>
                <Button 
                   variant="ghost"
                   className="rounded-2xl w-12 h-12 p-0 border border-slate-200 hover:bg-slate-50 text-slate-400 transition-all"
                >
                  <MoreHorizontal size={20} />
                </Button>
              </div>
            </div>

            {userData.bio && (
              <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-100 relative max-w-2xl">
                <div className="absolute -top-3 left-6 px-3 bg-white text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 rounded-full">Bio</div>
                <p className="text-slate-600 leading-relaxed font-bold italic text-base">
                  "{userData.bio}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
