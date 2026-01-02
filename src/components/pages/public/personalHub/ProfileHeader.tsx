// components/personalHub/ProfileHeader.tsx
import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import type { UserProfile, UserStats } from '../../../../types/personalHub';

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
  return (
    <Card className="mb-4 p-0" style={{ overflow: 'hidden' }}>
      {/* Cover Photo Area */}
      <div
        className="relative h-12rem md:h-15rem"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundImage: userData.coverPhoto ? `url(${userData.coverPhoto})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute top-2 right-2">
          <Button
            icon="pi pi-camera"
            className="p-button-rounded p-button-outlined"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
            tooltip="Change cover photo"
          />
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="p-4">
        <div className="flex flex-column md:flex-row align-items-start md:align-items-end gap-4" style={{ marginTop: '-3rem' }}>
          {/* Profile Picture */}
          <div className="relative">
            <Avatar
              image={userData.profilePicture}
              icon="pi pi-user"
              size="xlarge"
              shape="circle"
              style={{
                width: '120px',
                height: '120px',
                border: '4px solid white',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Button
              icon="pi pi-camera"
              className="p-button-rounded p-button-sm absolute"
              style={{
                bottom: '8px',
                right: '8px',
                backgroundColor: '#3b82f6',
                borderColor: '#3b82f6'
              }}
              onClick={() => document.getElementById('profile-picture-upload')?.click()}
            />
            <input
              id="profile-picture-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onProfilePictureUpload}
            />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 m-0">
                  {userData.fullName || userData.username}
                </h1>
                <p className="text-gray-600 mt-1">@{userData.username}</p>
                {userData.bio && (
                  <p className="text-gray-700 mt-2">{userData.bio}</p>
                )}
                <div className="flex align-items-center gap-2 mt-2">
                  <i className="pi pi-map-marker text-gray-500"></i>
                  <span className="text-gray-600">{userData.location || 'Location not set'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  label="Edit Profile"
                  icon="pi pi-user-edit"
                  className="p-button-outlined"
                  onClick={onEditProfile}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 mt-3">
              <div className="text-center">
                <div className="font-bold text-lg">{userStats.totalReports}</div>
                <div className="text-gray-600 text-sm">Reports</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{userStats.totalViews}</div>
                <div className="text-gray-600 text-sm">Views</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{userStats.resolvedReports}</div>
                <div className="text-gray-600 text-sm">Resolved</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};