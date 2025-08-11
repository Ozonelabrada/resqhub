import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Steps } from 'primereact/steps';
import { Dropdown } from 'primereact/dropdown';
import { InputMask } from 'primereact/inputmask';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
import { AuthService } from '../../../../services/authService';

const authService = new AuthService();

const SignUpPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    email: '',
    phone: '',
    
    // Step 2: Account Setup
    password: '',
    confirmPassword: '',
    
    // Step 3: Profile Details
    userType: '',
    organization: '',
    agreeToTerms: false,
    subscribeNewsletter: false
  });
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState('');

  const userTypes = [
    { label: 'Emergency Responder', value: 'responder' },
    { label: 'Community Member', value: 'community' },
    { label: 'Organization Representative', value: 'organization' }
  ];

  const steps = [
    { label: 'Basic Info' },
    { label: 'Account Setup' },
    { label: 'Profile Details' }
  ];

  const validateStep = (step: number) => {
    setError('');
    
    switch (step) {
      case 0:
        if (!formData.name.trim()) {
          setError('Full name is required');
          return false;
        }
        if (!formData.email.trim()) {
          setError('Email is required');
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        return true;
        
      case 1:
        if (!formData.password) {
          setError('Password is required');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        return true;
        
      case 2:
        if (!formData.userType) {
          setError('Please select your user type');
          return false;
        }
        if (!formData.agreeToTerms) {
          setError('You must agree to the terms and conditions');
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    setError('');

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: formData.userType,
        organization: formData.organization,
        agreeToNewsletter: formData.subscribeNewsletter,
        provider: 'local' as const
      };

      const response = await authService.signUp(registrationData);
      
      if (response && response.succeeded) {
        navigate('/signin', { 
          state: { 
            message: 'Account created successfully! Please sign in to continue.' 
          }
        });
      } else {
        setError(response?.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setSocialLoading(true);
    setError('');
    
    try {
      // Store current location for redirect after auth
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem('returnPath', currentPath);
      localStorage.setItem('intendedAction', 'signup');
      
      // Start Google OAuth2 flow
      await authService.startGoogleLogin();
    } catch (err) {
      console.error('Google signup error:', err);
      setError('Failed to start Google signup. Please try again.');
      setSocialLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="grid">
            <div className="col-12">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <InputText
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                className="w-full"
                disabled={loading}
              />
            </div>

            <div className="col-12">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <InputText
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email address"
                className="w-full"
                disabled={loading}
              />
            </div>

            <div className="col-12">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <InputMask
                mask="(999) 999-9999"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.value || '' }))}
                placeholder="(123) 456-7890"
                className="w-full"
                disabled={loading}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="grid">
            <div className="col-12">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password *
              </label>
              <InputText
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Create a strong password"
                className="w-full"
                disabled={loading}
              />
              <small className="text-gray-500">
                Password must be at least 6 characters long
              </small>
            </div>

            <div className="col-12">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password *
              </label>
              <InputText
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your password"
                className="w-full"
                disabled={loading}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid">
            <div className="col-12">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                User Type *
              </label>
              <Dropdown
                value={formData.userType}
                options={userTypes}
                onChange={(e) => setFormData(prev => ({ ...prev, userType: e.value }))}
                placeholder="Select your role"
                className="w-full"
                disabled={loading}
              />
            </div>

            {formData.userType === 'organization' && (
              <div className="col-12">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Name
                </label>
                <InputText
                  value={formData.organization}
                  onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="Enter your organization name"
                  className="w-full"
                  disabled={loading}
                />
              </div>
            )}

            <div className="col-12 mt-4">
              <div className="flex align-items-center mb-3">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.checked || false }))}
                  disabled={loading}
                />
                <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                  I agree to the{' '}
                  <Link to="/terms" className="text-green-600 hover:text-green-700 no-underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-green-600 hover:text-green-700 no-underline">
                    Privacy Policy
                  </Link>{' '}
                  *
                </label>
              </div>

              <div className="flex align-items-center">
                <Checkbox
                  id="subscribeNewsletter"
                  checked={formData.subscribeNewsletter}
                  onChange={(e) => setFormData(prev => ({ ...prev, subscribeNewsletter: e.checked || false }))}
                  disabled={loading}
                />
                <label htmlFor="subscribeNewsletter" className="ml-2 text-sm text-gray-700">
                  I'd like to receive updates and news about ResQHub
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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

      {/* Loading Overlay for Social Auth */}
      {socialLoading && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
            alt="Google"
            style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: '1rem' }}
          />
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem' }}>
            Redirecting to Google...
          </div>
          <div style={{ fontSize: '1rem', color: '#6b7280' }}>
            Please wait while we connect your Google account
          </div>
        </div>
      )}

      <Card
        className="w-full shadow-lg border-0"
        style={{
          maxWidth: '500px',
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
            <p className="text-gray-600">Create your account to get started</p>
          </div>

          {/* Quick Google Sign Up - Show only on first step */}
          {currentStep === 0 && (
            <div className="mb-6">
              <Button
                type="button"
                className="w-full p-button-outlined border-2"
                onClick={handleGoogleSignUp}
                disabled={loading || socialLoading}
                style={{
                  borderColor: '#db4437',
                  color: '#db4437',
                  padding: '12px',
                  borderRadius: 12,
                  fontWeight: 600
                }}
              >
                <div className="flex align-items-center justify-content-center gap-3">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                    alt="Google"
                    style={{ width: 20, height: 20 }}
                  />
                  Sign up with Google
                </div>
              </Button>
              
              <Divider align="center" className="my-4">
                <span className="text-gray-500 text-sm">or continue with email</span>
              </Divider>
            </div>
          )}

          {/* Progress Steps */}
          <style>
            {`
              .custom-steps {
                --p-steps-item-active-color: #10b981;
                --p-steps-item-color: #9ca3af;
              }
            `}
          </style>
          <div className="mb-6">
            <Steps 
              model={steps} 
              activeIndex={currentStep} 
              className="w-full custom-steps"
            />
          </div>

          {/* Error Message */}
          {error && <Message severity="error" text={error} className="w-full mb-4" />}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-content-between align-items-center">
              {currentStep > 0 ? (
                <Button
                  type="button"
                  label="Previous"
                  icon="pi pi-arrow-left"
                  className="p-button-text"
                  onClick={handlePrevious}
                  disabled={loading}
                />
              ) : (
                <div></div>
              )}

              <div>
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    label="Next"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    onClick={handleNext}
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: 12,
                      fontWeight: 600
                    }}
                  />
                ) : (
                  <Button
                    type="submit"
                    label={loading ? '' : 'Create Account'}
                    icon={loading ? '' : 'pi pi-check'}
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: 12,
                      fontWeight: 600
                    }}
                  >
                    {loading && (
                      <ProgressSpinner
                        style={{ width: '16px', height: '16px' }}
                        strokeWidth="3"
                        animationDuration="1s"
                      />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6 pt-4 border-top-1 surface-border">
            <span className="text-gray-600">Already have an account? </span>
            <Link
              to="/signin"
              className="text-green-600 hover:text-green-700 no-underline font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SignUpPage;