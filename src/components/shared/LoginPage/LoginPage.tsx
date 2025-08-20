import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { AuthService } from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext'; // Adjust path as needed

const authService = new AuthService();

type LoginResponse = {
  succeeded: boolean;
  message?: string;
  [key: string]: any;
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const auth = useAuth();
  const setIsAuthenticated = auth?.setIsAuthenticated;
  const setUserData = auth?.setUserData;
  const setToken = auth?.setToken;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let response: LoginResponse;
      if (isAdmin) {
        const axiosResponse = await AuthService.login({
          email: formData.email,
          password: formData.password
        });
        response = axiosResponse.data as LoginResponse;

        // Check for admin role and store token/user
        const user = response?.data?.user;
        const token = response?.data?.user.token;
        if (
          response &&
          response.succeeded === true &&
          user &&
          user.role &&
          user.role.toLowerCase() === 'admin'
        ) {
          if (setIsAuthenticated) setIsAuthenticated(true);
          if (setUserData) setUserData(user);
          if (setToken) setToken(user.token);
          localStorage.setItem('adminToken', user.token);
          localStorage.setItem('adminUserData', JSON.stringify(user));
          localStorage.setItem('adminUserId', user.id);
          if (auth) {
            auth.login(token, user, true);
          }
          navigate('/admin/dashboard', { replace: true });
          return;
        } else {
          setError('You do not have admin access.');
          return;
        }
      } else {
        response = await AuthService.signIn({
          email: formData.email,
          password: formData.password
        });
      }
      if (response && response.succeeded === true) {
        const user = response?.data?.user;
        const token = response?.data?.token;
        if (setIsAuthenticated) setIsAuthenticated(true);
        if (setUserData) setUserData(user);
        if (setToken) setToken(token);
        // Use public keys for public login
        localStorage.setItem('publicUserToken', token);
        localStorage.setItem('publicUserData', JSON.stringify(user));
        document.cookie = `publicUserToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        if (auth) {
          auth.login(token, user, false);
        }
        navigate('/');
        return;
      } else {
        setError(response?.message || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  function handleInputChange(field: string, value: string | boolean): void {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  return (
    <div
      className="min-h-screen flex align-items-center justify-content-center"
      style={{
          background: 'linear-gradient(135deg, #353333ff 0%, #475a4bff 50%, #888887ff 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '2rem 1rem',
        position: 'relative'
      }}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3Ccircle cx='53' cy='7' r='7'/%3E%3Ccircle cx='7' cy='53' r='7'/%3E%3Ccircle cx='53' cy='53' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      <div className="flex align-items-center justify-content-center w-full" style={{ zIndex: 1 }}>
        <Card
          className="shadow-8 border-round-xl relative z-1"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(12px)',
            width: '100%',
            maxWidth: '420px',
            margin: '0 auto',
            border: isAdmin ? '2px solid #475a4bff' : '2px solid #10b981',
            borderRadius: 24,
            boxShadow: isAdmin
              ? '0 8px 32px 0 rgba(185,28,28,0.15)'
              : '0 8px 32px 0 rgba(16,185,129,0.15)'
          }}
        >
          <div className="text-center mb-6">
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                background: isAdmin
                  ? 'linear-gradient(135deg, #475a4bff 0%, #1c7d17ff 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: isAdmin
                  ? '0 10px 15px -3px rgba(185,28,28,0.15)'
                  : '0 10px 15px -3px rgba(16,185,129,0.15)'
              }}
            >
              <i
                className={isAdmin ? "pi pi-shield" : "pi pi-user"}
                style={{ color: 'white', fontSize: 28 }}
              ></i>
            </div>
            <h2
              className={isAdmin ? "text-orange-700" : "text-green-700"}
              style={{
                fontWeight: 800,
                fontSize: '1.7rem',
                marginBottom: 0
              }}
            >
              {isAdmin ? "Admin Login" : "Welcome to ResQHub"}
            </h2>
            <p className="text-sm text-gray-600" style={{ marginTop: 8 }}>
              {isAdmin ? "Please log in as admin to continue" : "Please log in to continue"}
            </p>
          </div>
          {error && <Message severity="error" text={error} className="mb-3" />}
          <form className="p-fluid" onSubmit={handleSubmit}>
            <div className="field mb-3">
              <label htmlFor="email" className="font-semibold text-gray-700">Email</label>
              <InputText
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="you@example.com"
                className="w-full"
                disabled={loading}
                required
                style={{ borderRadius: 10, fontSize: '1rem' }}
              />
            </div>
            <div className="field mb-3">
              <label htmlFor="password" className="font-semibold text-gray-700">Password</label>
              <Password
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                feedback={false}
                toggleMask
                className="w-full"
                disabled={loading}
                required
                style={{ borderRadius: 10, fontSize: '1rem' }}
              />
            </div>
            <div className="flex justify-content-between align-items-center mb-4">
              <div className="flex align-items-center">
                <Checkbox inputId="remember" checked={formData.rememberMe} onChange={e => handleInputChange('rememberMe', e.checked ?? false)} />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-700">Remember me</label>
              </div>
              {!isAdmin && (
                <Link to="/forgot-password" className="text-sm text-green-600 hover:underline">Forgot password?</Link>
              )}
            </div>
            <Button
              label={loading ? "" : (isAdmin ? "Admin Login" : "Login")}
              icon={loading ? <ProgressSpinner style={{ width: '18px', height: '18px' }} strokeWidth="3" /> : "pi pi-sign-in"}
              className="w-full p-button-lg"
              type="submit"
              disabled={loading}
              style={{
                fontWeight: 700,
                fontSize: '1.1rem',
                borderRadius: 10,
                background: isAdmin
                  ? 'linear-gradient(135deg, #39ab76ff 0%, #475a4bff 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none'
              }}
            />
          </form>
          {!isAdmin && (
            <p className="mt-4 text-center text-sm text-gray-500">
              Don’t have an account? <Link to="/signup" className="text-green-600 hover:underline font-semibold">Sign up</Link>
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;


