import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Avatar } from '../../../ui';
import { Camera, MapPin, User as UserIcon, Edit3, Share2, MoreHorizontal } from 'lucide-react';
import type { UserProfile, UserStats } from '../../../../../types/personalHub';

interface ProfileHeaderProps {
  userData: UserProfile;
  userStats: UserStats;
  onEditProfile: () => void;
  onProfilePictureUpload: (event: any) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userData,
  userStats,
  onEditProfile,
  onProfilePictureUpload,
}) => {
  const { t } = useTranslation();
  return (
    <Card className="mb-8 overflow-hidden border-none shadow-xl rounded-3xl">
      {/* Cover Photo Area */}
      <div
        className="relative h-48 md:h-64 group"
        style={{
          background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
          backgroundImage: userData.coverPhoto ? `url(${userData.coverPhoto})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
        
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/20 backdrop-blur-md text-white hover:bg-white/40 border-none rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            <Camera size={18} />
          </Button>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="px-6 pb-6">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 relative z-10">
          {/* Profile Picture */}
          <div className="relative group">
            <div className="p-1 bg-white rounded-full shadow-2xl">
              <Avatar
                src={userData.profilePicture}
                fallback={userData.fullName?.charAt(0) || userData.username.charAt(0)}
                size="xl"
                className="w-32 h-32 md:w-40 md:h-40 border-4 border-white"
              />
            </div>
            <button
              onClick={() => document.getElementById('profile-picture-upload')?.click()}
              className="absolute bottom-2 right-2 bg-teal-600 text-white p-2.5 rounded-full shadow-lg hover:bg-teal-700 transition-all transform hover:scale-110 border-4 border-white"
            >
              <Camera size={18} />
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
          <div className="flex-1 pt-2 md:pt-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                    {userData.fullName || userData.username}
                  </h1>
                  {userData.isVerified && (
                    <div className="bg-teal-100 text-teal-600 p-1 rounded-full">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 011.414 1.414z" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-slate-500 font-bold text-lg">@{userData.username}</p>
                
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-sm font-semibold">
                    <MapPin size={14} className="text-teal-600" />
                    {userData.location || t('common.global_citizen')}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-sm font-semibold">
                    <UserIcon size={14} className="text-emerald-600" />
                    {t('common.joined')} {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Button
                  variant="primary"
                  onClick={onEditProfile}
                  className="flex-1 md:flex-none rounded-2xl px-6 py-2.5 font-bold shadow-lg shadow-teal-100 flex items-center justify-center gap-2"
                >
                  <Edit3 size={18} />
                  {t('common.edit_profile')}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl w-11 h-11 p-0 flex items-center justify-center border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <Share2 size={18} />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl w-11 h-11 p-0 flex items-center justify-center border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <MoreHorizontal size={18} />
                </Button>
              </div>
            </div>

            {userData.bio && (
              <div className="mt-6 max-w-2xl">
                <p className="text-slate-600 leading-relaxed font-medium italic">
                  "{userData.bio}"
                </p>
              </div>
            )}

            {/* Stats Summary Mobile */}
            <div className="flex md:hidden gap-6 mt-6 pt-6 border-t border-slate-100">
              <div>
                <div className="text-xl font-bold text-slate-900">{userStats.totalReports}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">{t('common.reports')}</div>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">{userStats.totalViews}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">{t('common.views')}</div>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">{userStats.resolvedReports}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">{t('common.resolved')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
