import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Textarea, Select, Button, Avatar } from '../../../ui';
import { Camera, User, MapPin, Info, Save, X } from 'lucide-react';
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
    await onSave(formData);
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
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              leftIcon={<User size={18} className="text-teal-600" />}
            />
            <Input
              label="Username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              leftIcon={<Info size={18} className="text-emerald-600" />}
            />
          </div>

          <Select
            label="Location"
            options={locationOptions}
            value={formData.location}
            onChange={(value) => handleInputChange('location', value)}
            placeholder="Select your location"
            leftIcon={<MapPin size={18} className="text-orange-600" />}
          />

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
