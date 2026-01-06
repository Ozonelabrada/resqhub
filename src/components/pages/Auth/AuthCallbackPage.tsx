import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Spinner, 
  Button, 
  Card, 
  Container, 
  Logo,
  Alert
} from '../../ui';
import { 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft, 
  CheckCircle2 
} from 'lucide-react';
import { authManager } from '../../../utils/sessionManager';

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

          // After successful login API call
          const user = {
            id: userId || '',
            name: userName || '',
            email: userEmail || '',
            picture: searchParams.get('user_picture') || ''
          };

          if (token) {
            authManager.setSession(token, user as any);
          }

          setSuccess(true);
          
          // Check for intended destination and redirect
          const returnPath = localStorage.getItem('returnPath') || '/';
          localStorage.removeItem('returnPath');
          setTimeout(() => {
            localStorage.removeItem('returnPath');
            localStorage.removeItem('intendedAction');
            localStorage.removeItem('tempOAuth2UserData');
            
            navigate(returnPath, { 
              replace: true,
              state: { 
                message: userName ? `Welcome back, ${userName}!` : 'Welcome back to SHERRA!' 
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

  const handleBackToSignIn = () => {
    // Clear any stored data and redirect to home
    localStorage.removeItem('tempOAuth2UserData');
    localStorage.removeItem('returnPath');
    localStorage.removeItem('intendedAction');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Container size="sm">
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-6" />
        </div>

        <Card className="p-8 md:p-12 text-center border-none shadow-2xl shadow-slate-200 rounded-[2.5rem]">
          {loading && (
            <div className="space-y-6 py-8">
              <div className="relative flex justify-center">
                <div className="absolute inset-0 bg-teal-100 blur-3xl rounded-full opacity-20 animate-pulse"></div>
                <Spinner size="xl" className="text-teal-600 relative z-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800">Authenticating...</h2>
                <p className="text-slate-500">Securely connecting your account</p>
              </div>
            </div>
          )}

          {success && (
            <div className="space-y-6 py-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800">Success!</h2>
                <p className="text-slate-500">Welcome back to SHERRA. Redirecting you now...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="space-y-6 py-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <AlertCircle className="w-10 h-10" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800">Authentication Error</h2>
                <Alert variant="danger" className="rounded-2xl mt-4">
                  {error}
                </Alert>
              </div>
              <div className="pt-6">
                <Button
                  onClick={handleBackToSignIn}
                  className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-100">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <ShieldCheck className="w-4 h-4" />
              Secure Authentication
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default AuthCallbackPage;