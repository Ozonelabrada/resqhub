import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  Input, 
  Button, 
  Alert
} from '../../ui';
import { Mail, Lock, LogIn, ArrowRight, Info } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, openSignUpModal } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] bg-slate-50/95 backdrop-blur-sm border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden">
        <div className="relative p-8 md:p-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full -ml-16 -mb-16 blur-2xl" />

          <DialogHeader className="relative z-10 space-y-2 mb-8">
            <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Sign in to reunite with your items and community on SHERRA.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert 
              type="error" 
              message={error}
              className="mb-6 rounded-2xl border-orange-100 bg-orange-50 text-orange-800 animate-in fade-in slide-in-from-top-1" 
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-600" />
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={loading}
                  className="rounded-2xl border-slate-200 focus:ring-teal-500 bg-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    Password
                  </label>
                  <button 
                    type="button" 
                    className="text-xs font-bold text-orange-600 hover:text-orange-700"
                    onClick={() => {
                        onClose();
                        navigate('/forgot-password');
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="rounded-2xl border-slate-200 focus:ring-teal-500 bg-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-100 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In to Account
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>

            <div className="text-center pt-2">
              <p className="text-slate-500 text-sm font-medium">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="text-teal-600 font-bold hover:underline"
                  onClick={() => {
                    onClose();
                    openSignUpModal();
                  }}
                >
                  Join SHERRA
                </button>
              </p>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
