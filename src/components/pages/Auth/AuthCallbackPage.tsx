import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check for error parameter from backend redirect
      const errorParam = searchParams.get('error');
      const errorMessage = searchParams.get('error_description') || searchParams.get('message');
      
      if (errorParam) {
        setError(errorMessage || `Authentication failed: ${errorParam}`);
        setLoading(false);
        return;
      }

      // Check for success parameter from backend redirect
      const success = searchParams.get('success');
      const token = searchParams.get('token');
      const userId = searchParams.get('user_id');
      const userName = searchParams.get('user_name');
      const userEmail = searchParams.get('user_email');
      const requiresRegistration = searchParams.get('requires_registration') === 'true';

      console.log('Backend redirect received:', { 
        success, 
        token: token ? 'Present' : 'Missing',
        userId,
        userName,
        userEmail,
        requiresRegistration,
        fullURL: window.location.href
      });

      if (success === 'true') {
        if (requiresRegistration) {
          // New user - needs to complete registration
          console.log('User needs to complete registration');
          
          // Store user data for registration page
          const tempUserData = {
            id: userId,
            name: userName,
            email: userEmail,
            googleId: userId,
            picture: searchParams.get('user_picture') || ''
          };
          
          localStorage.setItem('tempOAuth2UserData', JSON.stringify(tempUserData));
          
          // Redirect to complete registration
          navigate('/auth/register', {
            replace: true,
            state: { 
              fromOAuth2: true,
              userData: tempUserData 
            }
          });
          return;
        } else {
          // Existing user - sign them in
          console.log('Signing in existing user');
          
          if (token) {
            localStorage.setItem('publicUserToken', token);
          }
          
          if (userId && userName && userEmail) {
            const userData = {
              id: userId,
              name: userName,
              email: userEmail,
              picture: searchParams.get('user_picture') || ''
            };
            localStorage.setItem('publicUserData', JSON.stringify(userData));
          }

          setSuccess(true);
          
          // Check for intended destination and redirect
          const returnPath = localStorage.getItem('returnPath') || '/';
          
          setTimeout(() => {
            localStorage.removeItem('returnPath');
            localStorage.removeItem('intendedAction');
            localStorage.removeItem('tempOAuth2UserData');
            
            navigate(returnPath, { 
              replace: true,
              state: { 
                message: userName ? `Welcome back, ${userName}!` : 'Welcome back to ResQHub!' 
              } 
            });
          }, 1500);
        }
      } else {
        // No success parameter or other issues
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Auth callback error:', err);
      setError('Something went wrong during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    // Clear any stored data and redirect to sign-in
    localStorage.removeItem('tempOAuth2UserData');
    localStorage.removeItem('returnPath');
    localStorage.removeItem('intendedAction');
    navigate('/signin');
  };

  const handleContinueRegistration = () => {
    // Try to continue with registration if user data exists
    const tempUserData = localStorage.getItem('tempOAuth2UserData');
    if (tempUserData) {
      navigate('/auth/register');
    } else {
      handleRetry();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-column align-items-center justify-content-center"
      style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f9fafb 75%, #f3f4f6 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        position: 'relative',
        padding: '0 1rem'
      }}
    >
      {/* Subtle geometric pattern overlay */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Main content card */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24,
          padding: '3rem 2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(229, 231, 235, 0.8)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}
      >
        {loading && (
          <>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem',
                boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.3)'
              }}
            >
              <ProgressSpinner
                style={{ width: '40px', height: '40px' }}
                strokeWidth="3"
                fill="transparent"
                animationDuration="1.5s"
              />
            </div>
            <h2 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>
              Processing Google Sign-In...
            </h2>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '1rem' }}>
              Validating your credentials and setting up your account
            </p>
          </>
        )}

        {success && (
          <>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem',
                boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.3)'
              }}
            >
              <i className="pi pi-check" style={{ color: 'white', fontSize: 36 }}></i>
            </div>
            <h2 style={{ color: '#059669', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>
              Welcome to ResQHub!
            </h2>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '1rem' }}>
              Successfully signed in. Redirecting you now...
            </p>
          </>
        )}

        {error && (
          <>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem',
                boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.3)'
              }}
            >
              <i className="pi pi-times" style={{ color: 'white', fontSize: 36 }}></i>
            </div>
            <h2 style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>
              Authentication Failed
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '1rem' }}>
              {error}
            </p>
            <div className="flex flex-column gap-2">
              <Button
                label="Try Again"
                icon="pi pi-refresh"
                onClick={handleRetry}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 12,
                  fontWeight: 600
                }}
              />
              {localStorage.getItem('tempOAuth2UserData') && (
                <Button
                  label="Continue Registration"
                  icon="pi pi-user-plus"
                  className="p-button-outlined"
                  onClick={handleContinueRegistration}
                  style={{
                    borderColor: '#10b981',
                    color: '#10b981',
                    padding: '12px 24px',
                    borderRadius: 12,
                    fontWeight: 600
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;