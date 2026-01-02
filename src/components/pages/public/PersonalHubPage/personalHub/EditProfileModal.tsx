// components/personalHub/EditProfileModal.tsx
import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import type { EditProfileForm, UserProfile } from '../../../../../types/personalHub';

interface EditProfileModalProps {
  visible: boolean;
  userData: UserProfile;
  onHide: () => void;
  onSave: (formData: EditProfileForm) => Promise<void>;
  loading: boolean;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  userData,
  onHide,
  onSave,
  loading
}) => {
  const [formData, setFormData] = useState<EditProfileForm>({
    fullName: '',
    username: '',
    bio: '',
    location: '',
    profilePicture: '',
    coverPhoto: ''
  });

  const locationOptions = [
    { label: 'Select Location', value: '' },
    { label: 'New York, NY', value: 'New York, NY' },
    { label: 'Los Angeles, CA', value: 'Los Angeles, CA' },
    { label: 'Chicago, IL', value: 'Chicago, IL' },
    { label: 'Houston, TX', value: 'Houston, TX' },
    { label: 'Phoenix, AZ', value: 'Phoenix, AZ' },
    { label: 'Philadelphia, PA', value: 'Philadelphia, PA' },
    { label: 'San Antonio, TX', value: 'San Antonio, TX' },
    { label: 'San Diego, CA', value: 'San Diego, CA' },
    { label: 'Dallas, TX', value: 'Dallas, TX' },
    { label: 'San Jose, CA', value: 'San Jose, CA' }
  ];

  useEffect(() => {
    if (userData && visible) {
      setFormData({
        fullName: userData.fullName || '',
        username: userData.username || '',
        bio: userData.bio || '',
        location: userData.location || '',
        profilePicture: userData.profilePicture || '',
        coverPhoto: userData.coverPhoto || ''
      });
    }
  }, [userData, visible]);

  const handleInputChange = (field: keyof EditProfileForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureUpload = (event: any) => {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setFormData(prev => ({ ...prev, profilePicture: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPhotoUpload = (event: any) => {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setFormData(prev => ({ ...prev, coverPhoto: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    await onSave(formData);
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        username: userData.username || '',
        bio: userData.bio || '',
        location: userData.location || '',
        profilePicture: userData.profilePicture || '',
        coverPhoto: userData.coverPhoto || ''
      });
    }
    onHide();
  };

  return (
    <Dialog
      header="Edit Profile"
      visible={visible}
      style={{ width: '600px' }}
      onHide={handleCancel}
      modal
      draggable={false}
      resizable={false}
    >
      <div className="p-4">
        {/* Profile Picture Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <FileUpload
            mode="basic"
            accept="image/*"
            maxFileSize={1000000}
            onSelect={handleProfilePictureUpload}
            chooseLabel="Choose Profile Picture"
            className="w-full"
          />
        </div>

        {/* Cover Photo Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Photo
          </label>
          <FileUpload
            mode="basic"
            accept="image/*"
            maxFileSize={2000000}
            onSelect={handleCoverPhotoUpload}
            chooseLabel="Choose Cover Photo"
            className="w-full"
          />
        </div>

        {/* Form Fields */}
        <div className="grid">
          <div className="col-12 md:col-6 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <InputText
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full"
              placeholder="Enter your full name"
            />
          </div>

          <div className="col-12 md:col-6 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <InputText
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full"
              placeholder="Enter your username"
            />
          </div>

          <div className="col-12 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <InputTextarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Tell us about yourself"
            />
          </div>

          <div className="col-12 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <Dropdown
              value={formData.location}
              options={locationOptions}
              onChange={(e) => handleInputChange('location', e.value)}
              placeholder="Select your location"
              className="w-full"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-outlined"
            onClick={handleCancel}
            disabled={loading}
          />
          <Button
            label="Save Changes"
            icon="pi pi-check"
            onClick={handleSave}
            loading={loading}
            disabled={!formData.fullName || !formData.username}
          />
        </div>
      </div>
    </Dialog>
  );
};