import React, { useState, useRef, useEffect } from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Input, 
  Textarea, 
  Select, 
  Spinner,
  Alert,
  Toast,
  type ToastRef,
  Avatar,
  Card,
  Grid,
  GridItem
} from '../../ui';
import { 
  Camera, 
  User, 
  MapPin, 
  Info, 
  Trash2, 
  Upload, 
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Image as ImageIcon
} from 'lucide-react';
import { UserService, type BackendUserData } from '../../../services/userService';
import { STORAGE_KEYS } from '../../../constants';

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
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    sex: '',
    profilePicture: '',
    profilePictureUrl: '',
    coverPhoto: '' ,
    coverPhotoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const toast = useRef<ToastRef>(null);
  const profileUploadRef = useRef<HTMLInputElement>(null);
  const coverUploadRef = useRef<HTMLInputElement>(null);



  // Initialize form data when modal opens
  useEffect(() => {
    if (visible && userData) {
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        username: userData.username || '',
        bio: userData.bio || '',
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
  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
  const handleCoverPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
      profileUploadRef.current.value = '';
    }
  };

  // Remove cover photo
  const removeCoverPhoto = () => {
    setCoverPhotoPreview('');
    setFormData(prev => ({ ...prev, coverPhoto: '' }));
    if (coverUploadRef.current) {
      coverUploadRef.current.value = '';
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
        userName: formData.username,
        bio: formData.bio || null,
        phoneNumber: formData.phoneNumber || null,
        address: formData.address || null,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        sex: formData.sex || null,
        profilePicture: formData.profilePicture || formData.profilePictureUrl || null,
        profilePictureUrl: formData.profilePictureUrl || formData.profilePicture || null,
        coverPhoto: formData.coverPhoto || formData.coverPhotoUrl || null,
        coverPhotoUrl: formData.coverPhotoUrl || formData.coverPhoto || null
      };

      // Update user profile
      const updatedUser = await UserService.updateUserProfile(currentUserId, updateData);
      
      // Transform and update local data
      const transformedUserData = UserService.transformUserData(updatedUser);
      // Persist using centralized storage key so AuthManager picks it up
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(transformedUserData));
      
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

  return (
    <Modal 
      isOpen={visible} 
      onClose={onHide} 
      title="Edit Profile"
      size="xl"
    >
      <Toast ref={toast} />
      
      <ModalBody className="p-0">
        <div className="space-y-8">
          {/* Header Section with Cover & Profile Photo */}
          <div className="relative">
            {/* Cover Photo */}
            <div 
              className="h-48 md:h-64 w-full relative bg-slate-200 overflow-hidden"
              style={{
                background: coverPhotoPreview 
                  ? `url(${coverPhotoPreview})` 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/20" />
              
              {/* Cover Photo Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <input
                  type="file"
                  ref={coverUploadRef}
                  onChange={handleCoverPhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => coverUploadRef.current?.click()}
                  className="rounded-full bg-white/90 hover:bg-white text-slate-700 border-none shadow-lg"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Change Cover
                </Button>
                {coverPhotoPreview && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={removeCoverPhoto}
                    className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-red-500/90 hover:bg-red-500 border-none shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {!coverPhotoPreview && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/80">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Add a cover photo</p>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Picture */}
            <div className="px-6 md:px-10 -mt-16 relative z-10 flex items-end gap-6">
              <div className="relative group">
                <div className="p-1 bg-white rounded-full shadow-xl">
                  <Avatar 
                    src={profilePicturePreview}
                    alt="Profile"
                    size="xl"
                    className="w-32 h-32 md:w-40 md:h-40 border-4 border-white"
                  />
                </div>
                
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <input
                    type="file"
                    ref={profileUploadRef}
                    onChange={handleProfilePictureUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => profileUploadRef.current?.click()}
                    className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-slate-100 hover:bg-white text-slate-700 border-2 border-white shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  {profilePicturePreview && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={removeProfilePicture}
                      className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white border-2 border-white shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="pb-4 flex-1">
                <h3 className="text-2xl font-bold text-slate-800">
                  {formData.firstName && formData.lastName 
                    ? `${formData.firstName} ${formData.lastName}` 
                    : 'Your Name'}
                </h3>
                <p className="text-slate-500 font-medium">
                  @{formData.username || 'username'}
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="px-6 md:px-10 pb-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                  <User className="w-5 h-5 text-blue-500" />
                  Personal Information
                </h4>
                <p className="text-sm text-slate-500">Update your basic profile details</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-semibold text-slate-700">
                  First Name *
                </label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={errors.firstName}
                  placeholder="Enter your first name"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-semibold text-slate-700">
                  Last Name *
                </label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={errors.lastName}
                  placeholder="Enter your last name"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-semibold text-slate-700">
                  Username *
                </label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  error={errors.username}
                  placeholder="Enter your username"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Phone
                </label>
                <Input
                  id="phone"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+63 912 345 6789"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="address" className="text-sm font-semibold text-slate-700">
                  Address
                </label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street, barangay, city"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="dob" className="text-sm font-semibold text-slate-700">Date of Birth</label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="sex" className="text-sm font-semibold text-slate-700">Sex</label>
                <Select
                  id="sex"
                  value={formData.sex}
                  onChange={(v) => handleInputChange('sex', v)}
                  options={[
                    { label: 'Prefer not to say', value: '' },
                    { label: 'Female', value: 'female' },
                    { label: 'Male', value: 'male' },
                    { label: 'Other', value: 'other' }
                  ]}
                />
              </div>



              <div className="md:col-span-2 space-y-2">
                <label htmlFor="bio" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  Bio
                </label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  error={errors.bio}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="rounded-2xl"
                />
                <div className="flex justify-end">
                  <span className={`text-xs font-medium ${formData.bio.length > 500 ? 'text-red-500' : 'text-slate-400'}`}>
                    {formData.bio.length}/500 characters
                  </span>
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <Alert variant="info" className="rounded-[2rem] border-none bg-blue-50/50 p-6">
              <div className="flex gap-4">
                <div className="p-3 bg-blue-100 rounded-2xl h-fit">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h5 className="text-blue-900 font-bold mb-2">Profile Tips</h5>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <li className="text-blue-700 text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      Use a clear, recent profile photo
                    </li>
                    <li className="text-blue-700 text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      Landscape cover photos work best
                    </li>
                    <li className="text-blue-700 text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      Keep your bio concise and friendly
                    </li>
                    <li className="text-blue-700 text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      A complete profile builds trust
                    </li>
                  </ul>
                </div>
              </div>
            </Alert>
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="bg-slate-50/50 p-6 flex justify-end gap-4">
        <Button 
          onClick={handleSubmit}
          loading={loading}
          className="rounded-xl px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
        >
          Save Changes
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditProfileModal;