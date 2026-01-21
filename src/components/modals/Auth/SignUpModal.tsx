import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  Input, 
  Button, 
  Alert,
  ShadcnSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../../ui';
import { Mail, Lock, User, UserPlus, ArrowRight, Info, CheckCircle2, Calendar, MapPin, UserCheck } from 'lucide-react';
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
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    sex: '',
    address: '',
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
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Invalid email format';
    if (!formData.dateOfBirth) return 'Date of birth is required';
    if (!formData.sex) return 'Sex is required';
    if (!formData.address.trim()) return 'Address is required';
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
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        sex: formData.sex,
        address: formData.address,
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
      <DialogContent className="sm:max-w-[550px] bg-white border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden">
        <div className="relative p-8 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full -ml-16 -mb-16 blur-2xl" />

          <DialogHeader className="relative z-10 space-y-2 mb-8">
            <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight text-center">
              {t('auth.signup_title')}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium text-center">
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

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="space-y-4">
                  {/* Name Group */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-teal-500" />
                        First Name
                      </label>
                      <Input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="John"
                        required
                        disabled={loading}
                        className="rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all h-12 placeholder:text-slate-300 placeholder:font-normal"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-teal-500" />
                        Last Name
                      </label>
                      <Input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Doe"
                        required
                        disabled={loading}
                        className="rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all h-12 placeholder:text-slate-300 placeholder:font-normal"
                      />
                    </div>
                  </div>

                  {/* Date of Birth & Sex Group */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-teal-500" />
                        Date of Birth
                      </label>
                      <Input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        required
                        disabled={loading}
                        className="rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all h-12"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-teal-500" />
                        Sex
                      </label>
                      <ShadcnSelect
                        value={formData.sex}
                        onValueChange={(value) => handleInputChange('sex', value)}
                        disabled={loading}
                      >
                        <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all h-12">
                          <SelectValue placeholder="Select Sex" className="placeholder:text-slate-300" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </ShadcnSelect>
                    </div>
                  </div>

                  {/* Address Group */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-teal-500" />
                      Address
                    </label>
                    <Input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Rescue St, City, Country"
                      required
                      disabled={loading}
                      className="rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all h-12 placeholder:text-slate-300 placeholder:font-normal"
                    />
                  </div>

                  {/* Email Group */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-teal-500" />
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john.doe@example.com"
                      required
                      disabled={loading}
                      className="rounded-xl border-slate-200 focus:ring-teal-500 bg-white h-11 placeholder:text-slate-300 placeholder:font-normal"
                    />
                  </div>

                  {/* Password Group */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-emerald-500" />
                        Password
                      </label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        className="rounded-xl border-slate-200 focus:ring-teal-500 bg-white h-11 placeholder:text-slate-300 placeholder:font-normal"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-emerald-500" />
                        Confirm
                      </label>
                      <Input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        className="rounded-xl border-slate-200 focus:ring-teal-500 bg-white h-11 placeholder:text-slate-300 placeholder:font-normal"
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
                    className="mt-1 w-4 h-4 rounded-lg border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="agreeToTerms" className="text-xs font-medium text-slate-500 leading-normal">
                    {t('auth.agree_terms')}
                  </label>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  disabled={!formData.agreeToTerms || loading}
                  className="w-full h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-100 font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <UserPlus className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  Create Your Account
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>

                <div className="text-center pt-2 pb-4">
                  <p className="text-slate-500 text-sm font-medium">
                    {t('auth.already_account')}{' '}
                    <button
                      type="button"
                      className="text-teal-600 font-black hover:underline"
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
