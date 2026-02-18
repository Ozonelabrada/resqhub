import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Textarea, Select, Button, Avatar } from '../../../../ui';
import { Camera, User, MapPin, Info, Save, X, Phone } from 'lucide-react';
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
  const [formData, setFormData] = useState<EditProfileForm & {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    address?: string;
    dateOfBirth?: string;
    sex?: string;
    profilePictureUrl?: string;
    coverPhotoUrl?: string;
  }>({
    firstName: '',
    lastName: '',
    fullName: '',
    username: '',
    bio: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    sex: '',
    profilePicture: '',
    profilePictureUrl: '',
    coverPhoto: '' ,
    coverPhotoUrl: ''
  });



  useEffect(() => {
    if (userData && visible) {
      // try to split fullName into first/last when available
      const nameParts = (userData.fullName || '').split(' ').filter(Boolean);
      setFormData({
        firstName: userData.firstName ?? nameParts[0] ?? '',
        lastName: userData.lastName ?? nameParts.slice(1).join(' ') ?? '',
        fullName: userData.fullName || '',
        username: (userData.username || userData.userName) ?? '',
        bio: userData.bio || '',
        profilePicture: userData.profilePicture || userData.profilePictureUrl || '',
        profilePictureUrl: userData.profilePictureUrl || userData.profilePicture || '',
        coverPhoto: userData.coverPhoto || userData.coverPhotoUrl || '',
        coverPhotoUrl: userData.coverPhotoUrl || userData.coverPhoto || '',
        phoneNumber: (userData.phoneNumber || userData.phone) ?? '',
        address: userData.address ?? '',
        dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
        sex: userData.sex ?? ''
      });
    }
  }, [userData, visible]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: 'profilePicture' | 'coverPhoto', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData(prev => ({ ...prev, [field]: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    // Map modal fields to API-friendly payload
    const payload: Record<string, any> = {
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      // include both variants for compatibility
      username: formData.username || undefined,
      userName: formData.username || undefined,
      profilePictureUrl: formData.profilePictureUrl || formData.profilePicture || undefined,
      coverPhotoUrl: formData.coverPhotoUrl || formData.coverPhoto || undefined,
      profilePicture: formData.profilePicture || formData.profilePictureUrl || undefined,
      coverPhoto: formData.coverPhoto || formData.coverPhotoUrl || undefined,
      bio: formData.bio || undefined,
      phoneNumber: formData.phoneNumber || undefined,
      address: formData.address || undefined,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined,
      sex: formData.sex || undefined
    };

    await onSave(payload as any);
  };

  return (
    <Modal isOpen={visible} onClose={onHide} title="Edit Profile" size="lg">
      <ModalBody className="space-y-8 py-6">
        {/* Photos Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Profile Photos</h3>
          
          {/* Cover Photo Preview */}
          <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-100 group">
            {formData.coverPhoto ? (
              <img src={formData.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-600" />
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
              <label className="cursor-pointer bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/40 transition-all">
                <Camera size={24} />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload('coverPhoto', e)} 
                />
              </label>
            </div>
          </div>

          {/* Profile Picture Preview */}
          <div className="flex items-center gap-6 -mt-12 px-4 relative z-10">
            <div className="relative group">
              <div className="p-1 bg-white rounded-full shadow-xl">
                <Avatar
                  src={formData.profilePicture}
                  fallback={formData.fullName?.charAt(0) || formData.username.charAt(0)}
                  size="xl"
                  className="w-24 h-24 border-4 border-white"
                />
              </div>
              <label className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full shadow-lg hover:bg-teal-700 transition-all cursor-pointer border-2 border-white">
                <Camera size={14} />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload('profilePicture', e)} 
                />
              </label>
            </div>
            <div className="pt-10">
              <h4 className="font-bold text-slate-900">Profile Picture</h4>
              <p className="text-xs text-slate-500 font-medium">JPG, GIF or PNG. Max size of 2MB.</p>
            </div>
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="First Name"
              placeholder="Enter your first name"
              value={formData.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              leftIcon={<User size={18} className="text-teal-600" />}
            />
            <Input
              label="Last Name"
              placeholder="Enter your last name"
              value={formData.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              leftIcon={<User size={18} className="text-teal-600" />}
            />

            <Input
              label="Username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              leftIcon={<Info size={18} className="text-emerald-600" />}
            />

            <Input
              label="Phone Number"
              placeholder="e.g. +63 912 345 6789"
              value={formData.phoneNumber || ''}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              leftIcon={<Phone size={18} className="text-emerald-600" />}
            />
          </div>

          <Input
            label="Address"
            placeholder="Street, barangay, city"
            value={formData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            leftIcon={<MapPin size={18} className="text-orange-600" />}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            />
            <Select
              label="Sex"
              value={formData.sex || ''}
              onChange={(v) => handleInputChange('sex', v)}
              options={[
                { label: 'Prefer not to say', value: '' },
                { label: 'Female', value: 'female' },
                { label: 'Male', value: 'male' },
                { label: 'Other', value: 'other' }
              ]}
            />

          </div>

          <Textarea
            label="Bio"
            placeholder="Tell us a little about yourself..."
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
          />
        </div>
      </ModalBody>
      <ModalFooter className="bg-slate-50/50">
        <Button variant="outline" onClick={onHide} disabled={loading} className="rounded-xl px-6">
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSave} 
          loading={loading}
          className="rounded-xl px-8 bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-100 flex items-center gap-2"
        >
          <Save size={18} />
          Save Changes
        </Button>
      </ModalFooter>
    </Modal>
  );
};
