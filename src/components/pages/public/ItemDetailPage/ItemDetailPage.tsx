import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  User, 
  MessageSquare, 
  Share2, 
  Flag,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  Award,
  Clock,
  ExternalLink
} from 'lucide-react';
import { 
  Container, 
  Card, 
  Button, 
  Avatar, 
  Badge, 
  StatusBadge, 
  Spinner,
  Grid,
} from '../../../ui';
import CommentSection from '../../../features/comments/CommentSection';
import ReportAbuseModal from '../../../modals/ReportAbuseModal';
import { useAuth } from '../../../../context/AuthContext';
import { ReportsService, type LostFoundItem } from '../../../../services/reportsService';
import { useTranslation } from 'react-i18next';

const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, openLoginModal } = useAuth();
  
  const [item, setItem] = useState<LostFoundItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      setLoading(true);
      const data = await ReportsService.getReportById(id);
      
      if (data) {
        setItem(data);
      } else {
        // Fallback or error
        console.warn('Item not found, using fallback');
        // Add fallback if needed or navigate back
      }
      setLoading(false);
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800 mb-4">{t('report.item_not_found')}</h2>
          <p className="text-slate-500 mb-8 text-lg font-medium">{t('report.item_not_found_desc')}</p>
          <Button onClick={() => navigate('/hub')} className="bg-teal-600 text-white rounded-2xl px-8 py-4 h-auto font-bold text-lg">
            <ArrowLeft className="mr-2" />
            {t('report.back_to_hub')}
          </Button>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    if (item.images && item.images.length > 0) {
      setActiveImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const images = item.images?.length > 0 ? item.images.map(img => img.imageUrl) : [];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Container size="full" className="pt-8">
        <div className="max-w-[1600px] mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold transition-colors mb-8 group"
          >
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-all">
              <ArrowLeft size={20} />
            </div>
            <span>{t('report.back_to_feed')}</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content: Images & Details */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="overflow-hidden border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white">
              <div className="flex flex-col lg:flex-row">
                {/* Image Section */}
                <div className="lg:w-1/2 bg-slate-900 relative group min-h-[500px] flex items-center justify-center">
                  {images.length > 0 ? (
                    <img 
                      src={images[activeImageIndex]} 
                      alt={item.title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="text-white opacity-20 flex flex-col items-center font-black uppercase tracking-widest">
                      <Calendar size={64} className="mb-4" />
                      {t('report.no_image')}
                    </div>
                  )}

                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveImageIndex((prev) => (prev + 1) % images.length); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ChevronRight size={24} />
                      </button>
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md">
                        {images.map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-2 rounded-full transition-all ${i === activeImageIndex ? 'bg-white w-4' : 'bg-white/40'}`} 
                          />
                        ))}
                      </div>
                    </>
                  )}
                  
                    <div className="absolute top-6 left-6">
                      <StatusBadge status={String(item.status).toLowerCase() === 'reunited' ? 'reunited' : (item.reportType.toLowerCase() === 'lost' ? 'lost' : 'found')} />
                    </div>
                </div>

                {/* Info Content Section */}
                <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col">
                  <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-[0.2em] mb-4">
                    <Badge variant="outline" className="text-[10px] py-1 border-teal-100 bg-teal-50 text-teal-600 font-black">
                      {item.categoryName || t('report.category_fallback')}
                    </Badge>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-6">
                    {item.title}
                  </h1>

                  <div className="space-y-6 mb-10">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('report.location_found_lost')}</p>
                        <p className="text-slate-800 font-bold">{item.location}</p>
                        {item.specificLocation && (
                          <p className="text-sm text-slate-500 font-medium mt-0.5">{item.specificLocation}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('report.date_reported')}</p>
                        <p className="text-slate-800 font-bold">{new Date(item.dateCreated).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {item.rewardDetails && (
                      <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
                           <Award size={24} />
                         </div>
                         <div>
                            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-0.5">{t('report.reward_offered')}</p>
                            <p className="text-emerald-700 font-black text-lg">{item.rewardDetails}</p>
                         </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto">
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t('report.description')}</p>
                      <p className="text-slate-600 font-medium leading-relaxed">
                        {item.description || t('report.no_description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Discussion Section */}
            <Card className="p-8 md:p-12 border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{t('report.discussion')}</h2>
                    <p className="text-slate-500 text-sm font-medium">{t('report.discussion_desc')}</p>
                  </div>
                </div>
              </div>
              
              <CommentSection 
                itemId={item.id} 
                itemType={item.reportType.toLowerCase() === 'lost' ? 'lost' : 'found'} 
                itemOwnerId={item.user?.id}
              />
            </Card>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            {/* Owner Profile Card */}
            <Card className="p-8 border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">{t('report.reported_by')}</h3>
              <div className="flex items-center gap-4 mb-8">
                <Avatar 
                  src={item.user?.profilePictureUrl} 
                  className="w-16 h-16 border-4 border-slate-50 shadow-sm" 
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-slate-900 text-lg">{item.user?.fullName || item.user?.username}</h4>
                    <ShieldCheck size={16} className="text-blue-500 fill-blue-50" />
                  </div>
                  <p className="text-teal-600 font-bold text-sm">{t('report.verified_member')}</p>
                </div>
              </div>

              {!showContactInfo ? (
                <Button 
                  onClick={() => {
                    if (!isAuthenticated) {
                      openLoginModal();
                    } else {
                      setShowContactInfo(true);
                    }
                  }}
                  className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <User size={20} />
                  {t('report.contact_owner')}
                </Button>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100">
                    <p className="text-xs font-black text-teal-600 uppercase tracking-widest mb-2">{t('report.contact_details')}</p>
                    <p className="text-teal-900 font-bold flex items-center gap-2">
                       {item.contactInfo || t('report.contact_hidden')}
                    </p>
                  </div>
                  <Button 
                    className="w-full h-14 rounded-2xl bg-teal-600 text-white font-bold"
                    onClick={() => navigate('/feed?view=messages')}
                  >
                    {t('report.send_private_message')}
                  </Button>
                </div>
              )}
            </Card>

            {/* Related/Safety Card */}
            <Card className="p-8 border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-teal-900 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-teal-800/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
               <div className="relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                   <ShieldCheck size={24} className="text-teal-400" />
                 </div>
                 <h4 className="text-xl font-black mb-2 leading-tight">Safety Protocol</h4>
                 <p className="text-teal-200 text-sm font-medium leading-relaxed mb-6">
                   Always meet in public places when returning items. We recommend police stations or busy shopping centers.
                 </p>
                 <Button variant="ghost" className="text-white hover:bg-white/10 w-full rounded-xl font-bold border border-white/20">
                    Learn More
                 </Button>
               </div>
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-white hover:border-teal-600 hover:text-teal-600 transition-all">
                <Share2 size={18} className="mr-2" />
                Share
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all"
                onClick={() => {
                  if (!isAuthenticated) return openLoginModal();
                  setIsReportModalOpen(true);
                }}
              >
                <Flag size={18} className="mr-2" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Container>

    <ReportAbuseModal
      isOpen={isReportModalOpen}
      onClose={() => setIsReportModalOpen(false)}
      targetId={item.id}
      targetType="report"
    />
  </div>
);
};

export default ItemDetailPage;
