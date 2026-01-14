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
import { Mail, Lock, User, UserPlus, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { SITE } from '@/constants/site';
import { useTranslation } from 'react-i18next';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signup, openLoginModal } = useAuth();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Invalid email format';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.agreeToTerms) return 'You must agree to the terms';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        openLoginModal();
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-slate-50/95 backdrop-blur-sm border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden">
        <div className="relative p-8 md:p-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full -ml-16 -mb-16 blur-2xl" />

          <DialogHeader className="relative z-10 space-y-2 mb-8">
            <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">
              {t('auth.signup_title')}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              {t('auth.signup_subtitle', { site: SITE.name })}
            </DialogDescription>
          </DialogHeader>

          {success ? (
            <div className="py-12 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {t('auth.signup_success_title')}
              </h3>
              <p className="text-slate-500">
                {t('auth.signup_success_subtitle', { site: SITE.name })}
              </p>
              <div className="pt-4 flex items-center gap-2 text-teal-600 font-bold">
                <Info size={16} />
                Redirecting to login...
              </div>
            </div>
          ) : (
            <>
              {error && (
                <Alert 
                  type="error" 
                  message={error}
                  className="mb-6 rounded-2xl border-orange-100 bg-orange-50 text-orange-800 animate-in fade-in slide-in-from-top-1" 
                />
              )}

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-teal-600" />
                      {t('auth.full_name')}
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="John Doe"
                      required
                      disabled={loading}
                      className="rounded-xl border-slate-200 focus:ring-teal-500 bg-white h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-teal-600" />
                      {t('auth.email')}
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="name@example.com"
                      required
                      disabled={loading}
                      className="rounded-xl border-slate-200 focus:ring-teal-500 bg-white h-11"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        {t('auth.password')}
                      </label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        className="rounded-xl border-slate-200 focus:ring-teal-500 bg-white h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        {t('auth.confirm_password')}
                      </label>
                      <Input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        className="rounded-xl border-slate-200 focus:ring-teal-500 bg-white h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 py-2">
                  <input 
                    type="checkbox" 
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="agreeToTerms" className="text-xs font-medium text-slate-500 leading-normal">
                    {t('auth.agree_terms')}
                  </label>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-100 font-bold transition-all"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  {t('auth.create_account')}
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>

                <div className="text-center pt-4">
                  <p className="text-slate-500 text-sm font-medium">
                    {t('auth.already_account')}{' '}
                    <button
                      type="button"
                      className="text-teal-600 font-bold hover:underline"
                      onClick={() => {
                        onClose();
                        openLoginModal();
                      }}
                    >
                      {t('auth.sign_in')}
                    </button>
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
