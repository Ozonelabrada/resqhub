import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
import { AuthService } from '../../../../services/authService';

const authService = new AuthService();

const SignInPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  // Form validation
  useEffect(() => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const passwordValid = formData.password.length >= 6;
    setIsFormValid(emailValid && passwordValid);
  }, [formData]);

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
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

  // Helper function to extract error message from different response structures
  const extractErrorMessage = (error: any): string => {
    // If it's a direct error object with message
    if (error?.message) {
      return error.message;
    }
    
    // If it's a response object that failed with message
    if (error?.succeeded === false && error?.message) {
      return error.message;
    }
    
    // If it's an HTTP error response that was parsed
    if (error?.response?.message) {
      return error.response.message;
    }
    
    // If it's a network error or other error
    if (typeof error === 'string') {
      return error;
    }
    
    // Default fallback
    return 'An error occurred during sign in. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await authService.signIn({
        email: formData.email,
        password: formData.password,
      });

      console.log('Sign in response:', response); // Debug log

      // Handle successful response
      if (response && response.succeeded === true) {
        // Handle redirect after login
        const intendedAction = localStorage.getItem('intendedAction');
        const returnPath = localStorage.getItem('returnPath');
        if (intendedAction && returnPath) {
          localStorage.removeItem('intendedAction');
          localStorage.removeItem('returnPath');
          navigate(returnPath);
        } else {
          navigate('/');
        }
      } 
      // Handle unsuccessful response with specific status codes
      else if (response && response.succeeded === false) {
        let errorMessage = response.message || 'Sign in failed. Please try again.';
        
        // Handle specific status codes for better user experience
        switch (response.statusCode) {
          case 403:
            if (response.message?.toLowerCase().includes('not verified')) {
              errorMessage = `${response.message} Please check your email and click the verification link.`;
            } else {
              errorMessage = response.message || 'Access forbidden. Please check your credentials.';
            }
            break;
          case 401:
            errorMessage = response.message || 'Invalid email or password. Please check your credentials.';
            break;
          case 400:
            errorMessage = response.message || 'Invalid request. Please check your input.';
            break;
          case 429:
            errorMessage = response.message || 'Too many login attempts. Please try again later.';
            break;
          case 500:
            errorMessage = 'Server error occurred. Please try again later.';
            break;
          default:
            errorMessage = response.message || 'Sign in failed. Please try again.';
        }
        
        setErrors({ submit: errorMessage });
      }
      // Handle case where response structure is unexpected
      else {
        setErrors({ 
          submit: 'Unexpected response from server. Please try again.' 
        });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Extract error message from various error structures
      const errorMessage = extractErrorMessage(err);
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@resqhub.com',
      password: 'demo123',
      rememberMe: false
    });
  };


  const handleGoogleSignIn = () => {
    setSocialLoading(true);
    const apiUrl =
      import.meta.env.VITE_APP_API_BASE_URL;
    // Add a slight delay for UX polish
    setTimeout(() => {
      window.location.href = `${apiUrl}/auth/google`;
    }, 500);
  };

  // Inline styles to override any global CSS that might be setting width to 1%
  const inputOverrideStyles: React.CSSProperties = {
    width: '100% !important' as any,
    minWidth: '200px',
    flex: 1
  };
  // Add this method to handle email verification
  const handleEmailVerification = async () => {
    try {
      setLoading(true);
      setErrors({ 
        submit: 'Verification email sent! Please check your inbox and click the verification link.' 
      });
    } catch (error) {
      setErrors({ 
        submit: 'Failed to send verification email. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Update the error display to include verification button for unverified accounts
  const renderErrorMessage = () => {
    if (!errors.submit) return null;

    const isEmailNotVerified = errors.submit.toLowerCase().includes('not verified');

    return (
      <div className="mb-4">
        <Message severity="error" text={errors.submit} className="w-full" />
        {isEmailNotVerified && (
          <div className="mt-2 text-center">
            <Button
              label="Resend Verification Email"
              icon="pi pi-envelope"
              className="p-button-text p-button-sm"
              onClick={handleEmailVerification}
              disabled={loading || !formData.email}
            />
          </div>
        )}
      </div>
    );
  };

  function handleSocialLogin(): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="min-h-screen flex align-items-center justify-content-center px-4 py-8"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative'
      }}>

      {/* Loading Overlay for Social Auth */}
      {socialLoading && (
        <div style={{
          position: 'fixed',
          zIndex: 9999,
          inset: 0,
          background: 'rgba(255,255,255,0.85)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
            alt="Google"
            style={{ width: 64, marginBottom: 24, animation: 'spin 1.2s linear infinite' }}
          />
          <div style={{ fontSize: 20, color: '#333', fontWeight: 600, marginBottom: 8 }}>
            Redirecting to Google...
          </div>
          <div style={{ color: '#666' }}>Please wait while we connect you securely.</div>
          <style>
            {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
          </style>
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3Ccircle cx='53' cy='7' r='7'/%3E%3Ccircle cx='7' cy='53' r='7'/%3E%3Ccircle cx='53' cy='53' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
      </div>

      {/* Centered Container */}
      <div className="flex align-items-center justify-content-center w-full">
        <Card
          className="shadow-8 border-round-xl relative z-1"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto'
          }}
        >

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex align-items-center justify-content-center mb-3">
              {/* ResQHub text logo */}
              <div className="flex align-items-center justify-content-center">
                <span 
                  style={{ 
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #364730ff 0%, #1b6124ff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-1px',
                    marginBottom: '0 rem',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  ResQHub
                </span>
              </div>
            </div>
            
            {/* Catchy tagline */}
            <p className="text-lg text-gray-600 p-0 mb-4 font-medium" style={{ 
              letterSpacing: '0.3px',
              lineHeight: '1.4'
            }}>
              Reuniting people with their precious belongings
            </p>
            
            {/* Sign in message */}
            <h1 className="text-xl font-bold text-gray-800 m-0" style={{ letterSpacing: 0.3 }}>
              Welcome back! Please sign in to continue
            </h1>
          </div>

          {/* Demo Login Banner */}
          <div className="mb-4 p-3 border-round-lg" style={{ backgroundColor: '#e0f2fe', border: '1px solid #0277bd' }}>
            <div className="flex align-items-center justify-content-between">
              <div>
                <div className="text-sm font-semibold text-cyan-800">Try Demo Account</div>
                <div className="text-xs text-cyan-600">demo@resqhub.com / demo123</div>
              </div>
              <Button
                label="Use Demo"
                size="small"
                className="p-button-outlined p-button-sm"
                style={{ borderColor: '#0277bd', color: '#0277bd' }}
                onClick={handleDemoLogin}
              />
            </div>
          </div>

          {/* Error Message */}
          {renderErrorMessage()}

          {/* Sign In Form */}
          <div style={{ marginBottom: '1.5rem' }}>
            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="field mb-4">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="p-inputgroup" style={{ display: 'flex', width: '100%' }}>
                  <span className="p-inputgroup-addon">
                    <i className="pi pi-envelope"></i>
                  </span>
                  <InputText
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={(e) => validateField('email', e.target.value)}
                    placeholder="Enter your email"
                    className={`${errors.email ? 'p-invalid' : ''}`}
                    style={inputOverrideStyles}
                    required
                  />
                </div>
                {errors.email && <small className="p-error mt-1 block">{errors.email}</small>}
              </div>

              {/* Password Field - Using regular InputText instead of Password component */}
              <div className="field mb-4">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="p-inputgroup" style={{ display: 'flex', width: '100%', position: 'relative' }}>
                  <span className="p-inputgroup-addon">
                    <i className="pi pi-lock"></i>
                  </span>
                  <InputText
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onBlur={(e) => validateField('password', e.target.value)}
                    placeholder="Enter your password"
                    className={`${errors.password ? 'p-invalid' : ''}`}
                    style={{
                      width: '100%',
                      flex: 1,
                      paddingRight: '3rem',
                      borderLeft: 'none',
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0
                    }}
                    required
                  />
                  {/* Custom toggle button */}
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#6c757d',
                      cursor: 'pointer',
                      zIndex: 10,
                      padding: '4px'
                    }}
                    onClick={() => {
                      const input = document.getElementById('password') as HTMLInputElement;
                      if (input) {
                        input.type = input.type === 'password' ? 'text' : 'password';
                      }
                    }}
                  >
                    <i className="pi pi-eye" style={{ fontSize: '14px' }}></i>
                  </button>
                </div>
                {errors.password && <small className="p-error mt-1 block">{errors.password}</small>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex align-items-center justify-content-between mb-6">
                <div className="flex align-items-center">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.checked || false)}
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-primary-dark no-underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                label={loading ? '' : 'Sign In'}
                icon={loading ? '' : 'pi pi-sign-in'}
                className="w-full p-button-lg mb-4"
                disabled={!isFormValid || loading}
                style={{ position: 'relative', width: '100%' }}
              >
                {loading && (
                  <ProgressSpinner
                    style={{ width: '20px', height: '20px' }}
                    strokeWidth="3"
                    animationDuration="1s"
                  />
                )}
              </Button>
            </form>
          </div>

          {/* Social Login Divider */}
          <Divider align="center" className="my-4">
            <span className="text-gray-500 text-sm bg-white px-3">or continue with</span>
          </Divider>

          {/* Social Login Buttons */}
          <div className="mb-4">
            <div className="flex gap-3 flex-column md:flex-row">
              <Button
                onClick={handleSocialLogin}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                    alt="Google"
                    style={{ width: 18, height: 18, background: 'white', borderRadius: '50%' }}
                  />
                  <span style={{ fontWeight: 500, color: '#4285F4', fontSize: 15 }}>
                    Sign in with Google
                  </span>
                </span>
              </Button>
              <Button
                style={{
                  background: 'white',
                  border: '1.5px solid #4285F4',
                  color: '#4285F4',
                  fontWeight: 500,
                  fontSize: 15,
                  padding: '0.75rem 1.5rem',
                  minWidth: 200,
                  minHeight: 40,
                  margin: '0 auto',
                  display: 'block'
                }}
                onClick={handleGoogleSignIn}
                disabled={loading || socialLoading}
              />
              {/* You can add other social buttons here */}
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-3">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-primary font-semibold hover:text-primary-dark no-underline"
              >
                Create one now
              </Link>
            </p>

            {/* Back to Home */}
            <Button
              label="Back to Home"
              icon="pi pi-home"
              className="p-button-text text-sm"
              onClick={() => navigate('/')}
            />
          </div>

          {/* Security Badge */}
          <div className="text-center mt-4 pt-4 border-top-1 surface-border">
            <div className="flex align-items-center justify-content-center gap-2 text-xs text-gray-500">
              <i className="pi pi-shield"></i>
              <span>Protected by enterprise-grade security</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Help Button */}
      <Button
        icon="pi pi-question-circle"
        className="p-button-rounded p-button-help fixed"
        style={{ bottom: '2rem', right: '2rem', zIndex: 1000 }}
        tooltip="Need help? Contact support"
        onClick={() => navigate('/contact')}
      />
    </div>
  );
};

export default SignInPage;