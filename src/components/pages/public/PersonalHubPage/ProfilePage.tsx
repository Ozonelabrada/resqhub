import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Container,
  StatusBadge
} from '../../../ui';
import { useAuth } from '../../../../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Pencil, 
  FileText, 
  LogIn,
  ShieldCheck
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, openLoginModal } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-10 text-center rounded-[2.5rem] border-none shadow-2xl bg-white/80 backdrop-blur-xl">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-8">
            <User size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Not Signed In</h2>
          <p className="text-slate-500 font-medium mb-8">Please sign in to view your profile and manage your reports.</p>
          <Button 
            className="w-full rounded-2xl py-4 h-auto font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-teal-200"
            onClick={() => openLoginModal()}
          >
            <LogIn size={18} />
            Sign In Now
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <Container size="sm">
        <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
          {/* Header Section */}
          <div className="relative h-32 bg-gradient-to-r from-teal-600 to-emerald-700" />
          
          <div className="px-8 pb-10 -mt-16">
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-[2.5rem] bg-white p-2 shadow-xl mb-6">
                <div className="w-full h-full rounded-[2rem] bg-slate-100 flex items-center justify-center text-teal-600">
                  <User size={56} />
                </div>
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                {user.name || user.fullName || 'User'}
              </h2>
              <div className="flex items-center gap-2 text-slate-500 font-medium mb-8">
                <Mail size={16} />
                {user.email}
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-10">
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-teal-200 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600">
                      <ShieldCheck size={20} />
                    </div>
                    <span className="font-black uppercase tracking-widest text-[10px] text-slate-400">Full Name</span>
                  </div>
                  <p className="text-slate-900 font-bold">{user.fullName || user.name || '-'}</p>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-teal-200 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Phone size={20} />
                    </div>
                    <span className="font-black uppercase tracking-widest text-[10px] text-slate-400">Phone Number</span>
                  </div>
                  <p className="text-slate-900 font-bold">{user.phone || 'Not provided'}</p>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-teal-200 transition-colors md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                      <Calendar size={20} />
                    </div>
                    <span className="font-black uppercase tracking-widest text-[10px] text-slate-400">Member Since</span>
                  </div>
                  <p className="text-slate-900 font-bold">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    }) : '-'}
                  </p>
                </div>
              </div>

              <div className="w-full flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline"
                  className="flex-1 rounded-2xl py-4 h-auto font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                  onClick={() => navigate('/settings')}
                >
                  <Pencil size={18} />
                  Edit Profile
                </Button>
                <Button 
                  className="flex-1 rounded-2xl py-4 h-auto font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-teal-200"
                  onClick={() => navigate('/profile')}
                >
                  <FileText size={18} />
                  My Reports
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default ProfilePage;