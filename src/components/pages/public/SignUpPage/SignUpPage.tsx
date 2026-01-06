import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  Card, 
  Button, 
  Input, 
  Select, 
  Container, 
  Spinner,
  Alert
} from '../../../ui';
import { useAuth } from '../../../../context/AuthContext';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup, openLoginModal } = useAuth();
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
      navigate('/', {
        state: { 
          openLogin: true,
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
          <div className="space-y-6">
            <Input
              label="Full Name"
              icon={<User size={18} />}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
              disabled={loading}
              required
            />
            <Input
              label="Email Address"
              type="email"
              icon={<Mail size={18} />}
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email address"
              disabled={loading}
              required
            />
            <Input
              label="Phone Number"
              icon={<Phone size={18} />}
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(123) 456-7890"
              disabled={loading}
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <Input
              label="Password"
              type="password"
              icon={<Lock size={18} />}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Create a strong password"
              disabled={loading}
              required
              helperText="Password must be at least 6 characters long"
            />
            <Input
              label="Confirm Password"
              type="password"
              icon={<ShieldCheck size={18} />}
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirm your password"
              disabled={loading}
              required
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <Select
              label="User Type"
              value={formData.userType}
              options={userTypes}
              onChange={(value) => setFormData(prev => ({ ...prev, userType: value }))}
              placeholder="Select your role"
              disabled={loading}
              required
            />
            {formData.userType === 'organization' && (
              <Input
                label="Organization Name"
                icon={<Building2 size={18} />}
                value={formData.organization}
                onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                placeholder="Enter your organization name"
                disabled={loading}
              />
            )}
            <div className="space-y-4 pt-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 checked:bg-teal-600 checked:border-teal-600 transition-all"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                    disabled={loading}
                  />
                  <CheckCircle2 className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none p-0.5" />
                </div>
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                  I agree to the <Link to="/terms" className="text-teal-600 font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-teal-600 font-bold hover:underline">Privacy Policy</Link>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 checked:bg-teal-600 checked:border-teal-600 transition-all"
                    checked={formData.subscribeNewsletter}
                    onChange={(e) => setFormData(prev => ({ ...prev, subscribeNewsletter: e.target.checked }))}
                    disabled={loading}
                  />
                  <CheckCircle2 className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none p-0.5" />
                </div>
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                  I'd like to receive updates and news about ResQHub
                </span>
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-teal-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-emerald-600/10 blur-[120px] rounded-full" />
      </div>

      <Container size="sm" className="relative z-10">
        <Card className="border-none shadow-2xl rounded-[3rem] bg-white/95 backdrop-blur-xl overflow-hidden">
          <div className="p-10 md:p-16">
            <div className="text-center mb-12">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white shadow-2xl shadow-teal-200 mx-auto mb-8">
                <User size={36} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Create Account</h1>
              <p className="text-slate-500 font-medium">Join ResQHub to start making a difference</p>
            </div>
            {/* Custom Stepper */}
            <div className="flex items-center justify-between mb-12 relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2" />
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-teal-600 -translate-y-1/2 transition-all duration-500" 
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />
              {steps.map((step, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500 ${
                    idx <= currentStep 
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 scale-110' 
                      : 'bg-white text-slate-400 border-2 border-slate-100'
                  }`}>
                    {idx < currentStep ? <CheckCircle2 size={20} /> : idx + 1}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${
                    idx <= currentStep ? 'text-teal-600' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            {error && (
              <Alert 
                variant="error" 
                title="Registration Error"
                className="mb-8 rounded-3xl"
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="min-h-[300px]">
                {renderStepContent()}
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                {currentStep > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-2xl px-8 py-4 h-auto font-black uppercase tracking-widest text-xs flex items-center gap-3"
                    onClick={handlePrevious}
                    disabled={loading}
                  >
                    <ArrowLeft size={18} />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    className="rounded-2xl px-10 py-4 h-auto font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-teal-200 bg-teal-600 hover:bg-teal-700"
                    onClick={handleNext}
                    disabled={loading}
                  >
                    Next Step
                    <ArrowRight size={18} />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="rounded-2xl px-10 py-4 h-auto font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-teal-200 bg-teal-600 hover:bg-teal-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" variant="white" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Complete Sign Up
                        <CheckCircle2 size={18} />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>

            <div className="text-center mt-12 pt-8 border-t border-slate-100">
              <p className="text-slate-500 font-medium">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => openLoginModal()}
                  className="text-teal-600 hover:text-teal-700 font-black transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default SignUpPage;