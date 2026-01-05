import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { AuthService } from '../../../services/authService';

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
      navigate('/signin', {
        state: { 
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
          localStorage.setItem('publicUserToken', token);
        }
        if (user) {
          localStorage.setItem('publicUserData', JSON.stringify(user));
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
    navigate('/signin');
  };

  return (
    <div
      className="min-h-screen flex align-items-center justify-content-center"
      style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f9fafb 75%, #f3f4f6 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '2rem 1rem'
      }}
    >
      {/* Subtle background pattern */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <Card
        className="w-full shadow-lg border-0"
        style={{
          maxWidth: '600px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24,
          border: '1px solid rgba(229, 231, 235, 0.8)'
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)'
              }}
            >
              <i className="pi pi-user-plus" style={{ color: 'white', fontSize: 28 }}></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600">
              We've connected your Google account. Please provide some additional information.
            </p>
          </div>

          {/* Google Account Info - Show actual user data */}
          <div 
            className="mb-6 p-4 border-round-lg"
            style={{ 
              backgroundColor: '#f0f9ff', 
              border: '1px solid #0ea5e9'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {googleUserData.picture ? (
                <img
                  src={googleUserData.picture}
                  alt="Profile"
                  style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: '#0ea5e9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="pi pi-user" style={{ color: 'white', fontSize: 20 }}></i>
                </div>
              )}
              <div>
                <div className="text-lg font-semibold text-sky-800">
                  {googleUserData.name || 'Google User'}
                </div>
                <div className="text-sm text-sky-600">
                  {googleUserData.email || 'Connected with Google'}
                </div>
                <div className="text-xs text-sky-500 mt-1">
                  ✓ Verified Google Account
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <Message severity="error" text={errors.submit} className="w-full mb-4" />
          )}

          {/* Registration Form - Only additional information */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid">
              {/* Phone - Required */}
              <div className="col-12 md:col-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <InputText
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onBlur={(e) => validateField('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  className={`w-full ${errors.phone ? 'p-invalid' : ''}`}
                  disabled={loading}
                />
                {errors.phone && <small className="p-error block mt-1">{errors.phone}</small>}
              </div>

              {/* Location - Optional */}
              <div className="col-12 md:col-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <Dropdown
                  value={formData.location}
                  options={locationOptions}
                  onChange={(e) => handleInputChange('location', e.value)}
                  placeholder="Select your city"
                  className="w-full"
                  disabled={loading}
                />
              </div>

              {/* Bio - Optional */}
              <div className="col-12">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  About You (Optional)
                </label>
                <InputTextarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                  className="w-full"
                  maxLength={200}
                  disabled={loading}
                />
                <small className="text-gray-500">
                  {formData.bio.length}/200 characters
                </small>
              </div>
            </div>

            {/* Terms and Newsletter */}
            <div className="mt-6 space-y-3">
              <div className="flex align-items-center">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.checked || false)}
                  disabled={loading}
                />
                <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="/terms" className="text-green-600 hover:text-green-700 no-underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-green-600 hover:text-green-700 no-underline">
                    Privacy Policy
                  </a>{' '}
                  *
                </label>
              </div>

              <div className="flex align-items-center">
                <Checkbox
                  id="agreeToNewsletter"
                  checked={formData.agreeToNewsletter}
                  onChange={(e) => handleInputChange('agreeToNewsletter', e.checked || false)}
                  disabled={loading}
                />
                <label htmlFor="agreeToNewsletter" className="ml-2 text-sm text-gray-700">
                  I'd like to receive updates and news about SHERRA
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <Button
                type="submit"
                label={loading ? '' : 'Complete Registration'}
                icon={loading ? '' : 'pi pi-check'}
                className="w-full p-button-lg"
                disabled={!isFormValid || loading}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  padding: '16px',
                  borderRadius: 12,
                  fontWeight: 600
                }}
              >
                {loading && (
                  <ProgressSpinner
                    style={{ width: '20px', height: '20px' }}
                    strokeWidth="3"
                    animationDuration="1s"
                  />
                )}
              </Button>
            </div>

            {/* Back to Sign In */}
            <div className="text-center mt-4">
              <Button
                label="Back to Sign In"
                icon="pi pi-arrow-left"
                className="p-button-text text-sm"
                onClick={handleBackToSignIn}
                disabled={loading}
              />
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default OAuth2RegisterPage;