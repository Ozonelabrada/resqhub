import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Container,
  StatusBadge,
  Spinner
} from '../../../ui';
import { useAuth } from '../../../../context/AuthContext';
import { useUserReportsWithStatistics } from '../../../../hooks/useUserReports';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Pencil, 
  FileText, 
  LogIn,
  ShieldCheck,
  TrendingUp,
  Package,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const { reports, statistics, loading, error } = useUserReportsWithStatistics(user?.id);

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

              <div className="w-full">
                <Button 
                  variant="outline"
                  className="w-full rounded-2xl py-4 h-auto font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                  onClick={() => navigate('/settings')}
                >
                  <Pencil size={18} />
                  Edit Profile
                </Button>
              </div>

              {/* Statistics Section */}
              {statistics && (
                <div className="w-full">
                  <h3 className="text-xl font-black text-slate-900 mb-6 mt-10 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={20} />
                    Your Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Package size={16} className="text-blue-600" />
                        <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Total Reports</span>
                      </div>
                      <p className="text-2xl font-black text-blue-900">{statistics.totalReport}</p>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100/50 border border-rose-100">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={16} className="text-rose-600" />
                        <span className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">Lost Items</span>
                      </div>
                      <p className="text-2xl font-black text-rose-900">{statistics.lostCount}</p>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100/50 border border-emerald-100">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Found Items</span>
                      </div>
                      <p className="text-2xl font-black text-emerald-900">{statistics.foundCount}</p>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100/50 border border-amber-100">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-amber-600" />
                        <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Active</span>
                      </div>
                      <p className="text-2xl font-black text-amber-900">{statistics.activeCount}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reports Section */}
              {reports.length > 0 && (
                <div className="w-full">
                  <h3 className="text-xl font-black text-slate-900 mb-6 mt-10 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={20} />
                    Recent Reports
                  </h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {reports.slice(0, 5).map((report) => (
                      <div key={report.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-colors cursor-pointer" onClick={() => navigate(`/report/${report.id}`)}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-slate-900 text-sm">{report.title}</h4>
                              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                                report.reportType === 'lost' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {report.reportType}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mb-2 line-clamp-1">{report.description}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>📍 {report.location || 'Not specified'}</span>
                              {report.dateCreated && (
                                <span>{new Date(report.dateCreated).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-black uppercase px-3 py-1 rounded-lg ${
                              report.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {report.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {reports.length > 5 && (
                    <Button 
                      variant="outline"
                      className="w-full rounded-2xl py-3 h-auto font-black uppercase tracking-widest text-xs mt-4 flex items-center justify-center gap-2"
                      onClick={() => navigate('/my-reports')}
                    >
                      <FileText size={16} />
                      View All Reports
                    </Button>
                  )}
                </div>
              )}

              {loading && (
                <div className="w-full flex justify-center py-8">
                  <Spinner />
                </div>
              )}

              {error && (
                <div className="w-full p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default ProfilePage;