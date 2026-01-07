import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { 
  Card, 
  Input, 
  Textarea, 
  Button, 
  Select, 
  Alert,
  Container,
  Logo,
  Avatar
} from '../../ui';
import { 
  Phone, 
  MapPin, 
  Info, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft,
  Globe
} from 'lucide-react';
import { AuthService } from '../../../services/authService';
import { STORAGE_KEYS } from '../../../constants';

const OAuth2RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Google user data (read-only, pre-filled)
  const [googleUserData, setGoogleUserData] = useState({
    name: '',
    email: '',
    picture: '',
    googleId: ''
  });
  
  // Additional data to collect
  const [formData, setFormData] = useState({
    phone: '',
    location: '',
    bio: '',
    agreeToTerms: false,
    agreeToNewsletter: false
  });

  // Get Google user data from multiple sources
  useEffect(() => {
    let userData = null;

    // 1. First try to get from React Router state (from AuthCallback)
    if (location.state?.userData) {
      userData = location.state.userData;
    }
    
    // 2. Try to get from temporary localStorage (from AuthCallback)
    if (!userData) {
      const tempUserData = localStorage.getItem('tempOAuth2UserData');
      if (tempUserData) {
        try {
          userData = JSON.parse(tempUserData);
        } catch (error) {
          console.error('Error parsing temp OAuth2 user data:', error);
        }
      }
    }

    // 3. Fallback to URL params if available
    if (!userData) {
      const name = searchParams.get('name');
      const email = searchParams.get('email');
      const picture = searchParams.get('picture');
      const googleId = searchParams.get('googleId');
      
      if (name || email) {
        userData = {
          name: name ? decodeURIComponent(name) : '',
          email: email ? decodeURIComponent(email) : '',
          picture: picture ? decodeURIComponent(picture) : '',
          googleId: googleId ? decodeURIComponent(googleId) : ''
        };
      }
    }

    // Set the Google user data
    if (userData) {
      setGoogleUserData({
        name: userData.name || userData.displayName || '',
        email: userData.email || '',
        picture: userData.picture || userData.avatar || userData.profilePicture || '',
        googleId: userData.googleId || userData.id || ''
      });
    }

    // If no OAuth2 data found, redirect to sign-in
    if (!userData || (!userData.name && !userData.email)) {
      console.warn('No OAuth2 user data found, redirecting to sign-in');
      navigate('/', {
        state: { 
          openLogin: true,
          message: 'Please sign in with Google first to complete registration.' 
        }
      });
    }
  }, [searchParams, location.state, navigate]);

  // Form validation - only validate fields we're actually collecting
  useEffect(() => {
    const phoneValid = formData.phone.length >= 10;
    const termsValid = formData.agreeToTerms;
    const hasGoogleData = Boolean(googleUserData.name) && Boolean(googleUserData.email);
    
    setIsFormValid(phoneValid && termsValid && hasGoogleData);
  }, [formData, googleUserData]);

  const locationOptions = [
    { label: 'Select your city', value: '' },
    { label: 'New York, NY', value: 'new-york' },
    { label: 'Los Angeles, CA', value: 'los-angeles' },
    { label: 'Chicago, IL', value: 'chicago' },
    { label: 'Houston, TX', value: 'houston' },
    { label: 'Phoenix, AZ', value: 'phoenix' },
    { label: 'Philadelphia, PA', value: 'philadelphia' },
    { label: 'San Antonio, TX', value: 'san-antonio' },
    { label: 'San Diego, CA', value: 'san-diego' },
    { label: 'Dallas, TX', value: 'dallas' },
    { label: 'San Jose, CA', value: 'san-jose' },
    { label: 'Other', value: 'other' }
  ];

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'phone':
        if (!value) {
          newErrors.phone = 'Phone number is required';
        } else if (value.length < 10) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (typeof value === 'string') {
      validateField(name, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;

    setLoading(true);
    setErrors({});

    try {
      // Combine Google data with additional form data
      const registrationData = {
        // Google provided data
        name: googleUserData.name,
        email: googleUserData.email,
        // User provided additional data
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        agreeToNewsletter: formData.agreeToNewsletter,
        // OAuth2 specific fields that your backend should handle
        provider: 'google' as const,
        googleId: googleUserData.googleId,
        profilePicture: googleUserData.picture,
        // No password needed for OAuth2 users
        password: undefined
      };

      console.log('Submitting OAuth2 registration data:', registrationData);

      // Use the standard register endpoint - your backend should detect OAuth2 users
      const response = await AuthService.signUp(registrationData);
      
      if (response && response.succeeded) {
        // Save user data - handle different response structures
        const token = response.data?.token || response.token;
        const user = response.data?.user || response.user;

        if (token) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        }
        if (user) {
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        }

        // Clear temporary OAuth2 data
        localStorage.removeItem('tempOAuth2UserData');

        // Redirect to intended destination or home
        const returnPath = localStorage.getItem('returnPath') || '/';
        localStorage.removeItem('returnPath');
        
        navigate(returnPath, { 
          state: { 
            message: `Welcome to SHERRA, ${user?.name || googleUserData.name}! Your account has been created successfully.` 
          }
        });
      } else {
        setErrors({ submit: response?.message || 'Registration failed. Please try again.' });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    // Clear any temporary data
    localStorage.removeItem('tempOAuth2UserData');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8">
      <Container size="md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto mb-6" />
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Complete Your Profile</h1>
          <p className="text-slate-500 mt-2">Just a few more details to get you started with SHERRA</p>
        </div>

        <Card className="overflow-hidden border-none shadow-2xl shadow-slate-200 rounded-[2.5rem]">
          <div className="flex flex-col md:flex-row">
            {/* Left Side: Google Info */}
            <div className="md:w-1/3 bg-teal-600 p-8 md:p-10 text-white flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <Avatar 
                  src={googleUserData.picture} 
                  alt={googleUserData.name}
                  size="xl"
                  className="w-24 h-24 md:w-32 md:h-32 border-4 border-white/20 shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg">
                  <Globe className="w-5 h-5 text-teal-600" />
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold">{googleUserData.name}</h3>
                <p className="text-teal-100 text-sm">{googleUserData.email}</p>
              </div>

              <div className="pt-6 border-t border-white/10 w-full">
                <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-200">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Account
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="md:w-2/3 p-8 md:p-12 bg-white">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-teal-500" />
                      Phone Number *
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      error={errors.phone}
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      Location
                    </label>
                    <Select
                      value={formData.location}
                      onChange={(value) => handleInputChange('location', value)}
                      options={locationOptions}
                      placeholder="Select location"
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-500" />
                      Bio
                    </label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us a bit about yourself..."
                      rows={3}
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                        className="w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                      />
                    </div>
                    <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                      I agree to the <a href="/terms" className="text-blue-600 font-bold hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-600 font-bold hover:underline">Privacy Policy</a>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.agreeToNewsletter}
                        onChange={(e) => handleInputChange('agreeToNewsletter', e.target.checked)}
                        className="w-5 h-5 rounded-lg border-2 border-slate-200 text-teal-600 focus:ring-teal-500 transition-all cursor-pointer"
                      />
                    </div>
                    <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                      Keep me updated with community news and alerts
                    </span>
                  </label>
                </div>

                {errors.submit && (
                  <Alert variant="danger" className="rounded-2xl">
                    {errors.submit}
                  </Alert>
                )}

                <div className="flex flex-col gap-4 pt-4">
                  <Button
                    type="submit"
                    isLoading={loading}
                    disabled={!isFormValid || loading}
                    className="w-full py-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-100 font-bold text-lg"
                  >
                    Complete Registration
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBackToSignIn}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl text-slate-500 hover:text-slate-800 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} SHERRA. All rights reserved.
          </p>
        </div>
      </Container>
    </div>
  );
};

export default OAuth2RegisterPage;