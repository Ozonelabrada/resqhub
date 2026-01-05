import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAuth } from '../../../context/AuthContext'; 

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, user, login } = useAuth();

  // Redirect authenticated users away from login page
  if (isAuthenticated && !isLoading) {
    const from = location.state?.from?.pathname || '/hub';
    return <Navigate to={from} replace />;
  }

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
      await login(formData.email, formData.password);
      
      // Explicitly navigate after successful login
      const from = location.state?.from?.pathname || '/hub';
      navigate(from, { replace: true });
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
            border: '2px solid #10b981',
            borderRadius: 24,
            boxShadow: '0 8px 32px 0 rgba(16,185,129,0.15)'
          }}
        >
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
                boxShadow: '0 10px 15px -3px rgba(16,185,129,0.15)'
              }}
            >
              <i
                className="pi pi-user"
                style={{ color: 'white', fontSize: 28 }}
              ></i>
            </div>
            <h2
              className="text-green-700"
              style={{
                fontWeight: 800,
                fontSize: '1.7rem',
                marginBottom: 0
              }}
            >
              Welcome to SHERRA
            </h2>
            <p className="text-sm text-gray-600" style={{ marginTop: 8 }}>
              Please log in to continue
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
              <Link to="/forgot-password" className="text-sm text-green-600 hover:underline">Forgot password?</Link>
            </div>
            <Button
              label={loading ? "" : "Login"}
              icon={loading ? <ProgressSpinner style={{ width: '18px', height: '18px' }} strokeWidth="3" /> : "pi pi-sign-in"}
              className="w-full p-button-lg"
              type="submit"
              disabled={loading}
              style={{
                fontWeight: 700,
                fontSize: '1.1rem',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none'
              }}
            />
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Don’t have an account? <Link to="/signup" className="text-green-600 hover:underline font-semibold">Sign up</Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;


