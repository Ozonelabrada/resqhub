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
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAuth } from '../../../../context/AuthContext';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: '',
    organization: '',
    agreeToTerms: false,
    subscribeNewsletter: false
  });
  const [loading, setLoading] = useState(false);
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
        agreeToNewsletter: formData.subscribeNewsletter
      };
      await signup(registrationData);
      navigate('/login', {
        state: {
          message: 'Account created successfully! Please sign in to continue.'
        }
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
                  I'd like to receive updates and news about SHERRA
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
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #353333ff 0%, #475a4bff 50%, #888887ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        zIndex: 1 // Ensure it does not overlay the header
      }}
    >
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
          {error && <Message severity="error" text={error} className="w-full mb-4" />}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">{renderStepContent()}</div>
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