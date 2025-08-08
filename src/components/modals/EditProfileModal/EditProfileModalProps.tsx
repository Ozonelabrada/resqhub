import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { Avatar } from 'primereact/avatar';
import { Image } from 'primereact/image';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { UserService, type BackendUserData } from '../../../services/userService';

interface EditProfileModalProps {
  visible: boolean;
  onHide: () => void;
  userData: any;
  onUserDataUpdate: (updatedUser: any) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onHide,
  userData,
  onUserDataUpdate
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    location: '',
    profilePicture: '',
    coverPhoto: ''
  });
  const [loading, setLoading] = useState(false);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const toast = useRef<Toast>(null);
  const profileUploadRef = useRef<FileUpload>(null);
  const coverUploadRef = useRef<FileUpload>(null);

  // Location options
  const locationOptions = [
    { label: 'Select your location', value: '' },
    { label: 'New York, NY', value: 'New York, NY' },
    { label: 'Los Angeles, CA', value: 'Los Angeles, CA' },
    { label: 'Chicago, IL', value: 'Chicago, IL' },
    { label: 'Houston, TX', value: 'Houston, TX' },
    { label: 'Phoenix, AZ', value: 'Phoenix, AZ' },
    { label: 'Philadelphia, PA', value: 'Philadelphia, PA' },
    { label: 'San Antonio, TX', value: 'San Antonio, TX' },
    { label: 'San Diego, CA', value: 'San Diego, CA' },
    { label: 'Dallas, TX', value: 'Dallas, TX' },
    { label: 'San Jose, CA', value: 'San Jose, CA' },
    { label: 'Austin, TX', value: 'Austin, TX' },
    { label: 'Jacksonville, FL', value: 'Jacksonville, FL' },
    { label: 'Fort Worth, TX', value: 'Fort Worth, TX' },
    { label: 'Columbus, OH', value: 'Columbus, OH' },
    { label: 'Charlotte, NC', value: 'Charlotte, NC' },
    { label: 'San Francisco, CA', value: 'San Francisco, CA' },
    { label: 'Indianapolis, IN', value: 'Indianapolis, IN' },
    { label: 'Seattle, WA', value: 'Seattle, WA' },
    { label: 'Denver, CO', value: 'Denver, CO' },
    { label: 'Other', value: 'Other' }
  ];

  // Initialize form data when modal opens
  useEffect(() => {
    if (visible && userData) {
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        username: userData.username || '',
        bio: userData.bio || '',
        location: userData.location || '',
        profilePicture: userData.profilePicture || '',
        coverPhoto: userData.coverPhoto || ''
      });
      setProfilePicturePreview(userData.profilePicture || '');
      setCoverPhotoPreview(userData.coverPhoto || '');
      setErrors({});
    }
  }, [visible, userData]);

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = (event: any) => {
    const file = event.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Profile picture must be less than 5MB',
          life: 3000
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Please select a valid image file',
          life: 3000
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePicturePreview(result);
        setFormData(prev => ({ ...prev, profilePicture: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle cover photo upload
  const handleCoverPhotoUpload = (event: any) => {
    const file = event.files[0];
    if (file) {
      // Validate file size (10MB max for cover photos)
      if (file.size > 10 * 1024 * 1024) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Cover photo must be less than 10MB',
          life: 3000
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Please select a valid image file',
          life: 3000
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCoverPhotoPreview(result);
        setFormData(prev => ({ ...prev, coverPhoto: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile picture
  const removeProfilePicture = () => {
    setProfilePicturePreview('');
    setFormData(prev => ({ ...prev, profilePicture: '' }));
    if (profileUploadRef.current) {
      profileUploadRef.current.clear();
    }
  };

  // Remove cover photo
  const removeCoverPhoto = () => {
    setCoverPhotoPreview('');
    setFormData(prev => ({ ...prev, coverPhoto: '' }));
    if (coverUploadRef.current) {
      coverUploadRef.current.clear();
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const currentUserId = UserService.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('User ID not found');
      }

      // Prepare update data
      const updateData: Partial<BackendUserData> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        username: formData.username,
        bio: formData.bio || null,
        location: formData.location || null,
        profilePicture: formData.profilePicture,
        coverPhoto: formData.coverPhoto || null
      };

      // Update user profile
      const updatedUser = await UserService.updateUserProfile(currentUserId, updateData);
      
      // Transform and update local data
      const transformedUserData = UserService.transformUserData(updatedUser);
      localStorage.setItem('publicUserData', JSON.stringify(transformedUserData));
      
      // Call parent update function
      onUserDataUpdate(transformedUserData);
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Profile updated successfully',
        life: 3000
      });

      // Close modal
      onHide();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update profile. Please try again.',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Dialog header
  const dialogHeader = (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-user-edit text-blue-500"></i>
      <span>Edit Profile</span>
    </div>
  );

  // Dialog footer
  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
        disabled={loading}
      />
      <Button
        label={loading ? "Saving..." : "Save Changes"}
        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
        onClick={handleSubmit}
        disabled={loading}
        autoFocus
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        header={dialogHeader}
        footer={dialogFooter}
        style={{ width: '90vw', maxWidth: '800px' }}
        modal
        resizable={false}
        draggable={false}
        className="edit-profile-modal"
      >
        <div className="edit-profile-content">
          {/* Cover Photo Section */}
          <Card className="mb-4 p-0" style={{ overflow: 'hidden' }}>
            <div className="relative">
              <div 
                className="relative h-8rem"
                style={{
                  background: coverPhotoPreview 
                    ? `url(${coverPhotoPreview})` 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Cover Photo Controls */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <FileUpload
                    ref={coverUploadRef}
                    mode="basic"
                    name="coverPhoto"
                    accept="image/*"
                    maxFileSize={10000000}
                    onSelect={handleCoverPhotoUpload}
                    chooseOptions={{
                      icon: 'pi pi-camera',
                      className: 'p-button-rounded p-button-sm',
                      style: { 
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        color: '#333'
                      }
                    }}
                    auto
                  />
                  {coverPhotoPreview && (
                    <Button
                      icon="pi pi-trash"
                      className="p-button-rounded p-button-sm p-button-danger"
                      style={{ backgroundColor: 'rgba(220, 38, 38, 0.9)' }}
                      onClick={removeCoverPhoto}
                      tooltip="Remove cover photo"
                    />
                  )}
                </div>

                {!coverPhotoPreview && (
                  <div className="absolute inset-0 flex align-items-center justify-content-center">
                    <div className="text-center text-white">
                      <i className="pi pi-image text-4xl mb-2 block opacity-70"></i>
                      <p className="text-sm opacity-90">Click camera to add cover photo</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Picture Section */}
              <div className="p-4">
                <div className="flex align-items-end gap-4" style={{ marginTop: '-3rem' }}>
                  <div className="relative">
                    {profilePicturePreview ? (
                      <Image
                        src={profilePicturePreview}
                        alt="Profile Preview"
                        className="border-circle border-4 border-white shadow-4"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    ) : (
                      <Avatar 
                        icon="pi pi-user" 
                        size="xlarge"
                        shape="circle"
                        className="border-4 border-white shadow-4"
                        style={{ 
                          width: '100px', 
                          height: '100px', 
                          fontSize: '2.5rem',
                          backgroundColor: '#667eea', 
                          color: 'white' 
                        }}
                      />
                    )}
                    
                    {/* Profile Picture Controls */}
                    <div className="absolute bottom-0 right-0 flex gap-1">
                      <FileUpload
                        ref={profileUploadRef}
                        mode="basic"
                        name="profilePic"
                        accept="image/*"
                        maxFileSize={5000000}
                        onSelect={handleProfilePictureUpload}
                        chooseOptions={{
                          icon: 'pi pi-camera',
                          className: 'p-button-rounded p-button-sm',
                          style: { 
                            width: '2rem', 
                            height: '2rem',
                            backgroundColor: '#e4e6ea',
                            border: '2px solid white',
                            color: '#333'
                          }
                        }}
                        auto
                      />
                      {profilePicturePreview && (
                        <Button
                          icon="pi pi-trash"
                          className="p-button-rounded p-button-sm p-button-danger"
                          style={{ 
                            width: '2rem', 
                            height: '2rem',
                            border: '2px solid white'
                          }}
                          onClick={removeProfilePicture}
                          tooltip="Remove profile picture"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="m-0 text-gray-800">
                      {formData.firstName && formData.lastName 
                        ? `${formData.firstName} ${formData.lastName}` 
                        : 'Your Name'}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      @{formData.username || 'username'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Divider />

          {/* Form Fields */}
          <div className="grid">
            {/* Personal Information */}
            <div className="col-12">
              <h4 className="text-gray-800 mb-3">Personal Information</h4>
            </div>

            {/* First Name */}
            <div className="col-12 md:col-6">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <InputText
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full ${errors.firstName ? 'p-invalid' : ''}`}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <small className="p-error block mt-1">{errors.firstName}</small>
              )}
            </div>

            {/* Last Name */}
            <div className="col-12 md:col-6">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <InputText
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full ${errors.lastName ? 'p-invalid' : ''}`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <small className="p-error block mt-1">{errors.lastName}</small>
              )}
            </div>

            {/* Username */}
            <div className="col-12 md:col-6">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <InputText
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`w-full ${errors.username ? 'p-invalid' : ''}`}
                placeholder="Enter your username"
              />
              {errors.username && (
                <small className="p-error block mt-1">{errors.username}</small>
              )}
            </div>

            {/* Location */}
            <div className="col-12 md:col-6">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <Dropdown
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.value)}
                options={locationOptions}
                className="w-full"
                placeholder="Select your location"
                filter
                showClear
              />
            </div>

            {/* Bio */}
            <div className="col-12">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <InputTextarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className={`w-full ${errors.bio ? 'p-invalid' : ''}`}
                placeholder="Tell us about yourself..."
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-content-between mt-1">
                {errors.bio && (
                  <small className="p-error">{errors.bio}</small>
                )}
                <small className="text-gray-500 ml-auto">
                  {formData.bio.length}/500 characters
                </small>
              </div>
            </div>
          </div>

          <Divider />

          {/* Help Text */}
          <div className="bg-blue-50 border-round p-3">
            <div className="flex align-items-start gap-2">
              <i className="pi pi-info-circle text-blue-600 mt-1"></i>
              <div>
                <h5 className="text-blue-800 m-0 mb-2">Profile Tips</h5>
                <ul className="text-blue-700 text-sm pl-0 m-0" style={{ listStyle: 'none' }}>
                  <li className="mb-1">• Use a clear, recent photo for your profile picture</li>
                  <li className="mb-1">• Cover photos work best in landscape orientation</li>
                  <li className="mb-1">• Keep your bio concise and friendly</li>
                  <li>• A complete profile helps build trust with other users</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default EditProfileModal;