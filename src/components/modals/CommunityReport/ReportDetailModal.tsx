import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button, Avatar, ShadcnBadge as Badge } from '@/components/ui';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Share2, 
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Newspaper,
  Calendar as CalendarIcon,
  MessageSquare,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatSimpleMarkdown } from '@/utils/validation';
import type { CommunityPost } from '@/types/community';

export interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: CommunityPost | null;
}

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ isOpen, onClose, report }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!report) return null;

  const images = report.images || [];
  const hasImages = images.length > 0;

  const nextImage = () => {
    if (hasImages) {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'announcement': return <Megaphone size={16} />;
      case 'news': return <Newspaper size={16} />;
      case 'events': return <CalendarIcon size={16} />;
      default: return <Megaphone size={16} />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'announcement': return "bg-teal-50 text-teal-600 border-teal-100";
      case 'news': return "bg-blue-50 text-blue-600 border-blue-100";
      case 'events': return "bg-purple-50 text-purple-600 border-purple-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-white rounded-[2.5rem]">
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh] overflow-y-auto lg:overflow-hidden">
          {/* Left Side: Image Gallery */}
          <div className="lg:w-1/2 bg-slate-900 relative group min-h-[300px] lg:min-h-full flex items-center justify-center">
            {hasImages ? (
              <>
                <img 
                  src={images[activeImageIndex].imageUrl} 
                  alt={report.title} 
                  className="w-full h-full object-contain"
                />
                
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight size={24} />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 bg-black/20 rounded-full">
                      {images.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={cn(
                            "w-1.5 h-1.5 rounded-full transition-all",
                            idx === activeImageIndex ? "bg-white w-4" : "bg-white/40"
                          )} 
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 gap-4">
                <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center">
                  {getTypeIcon(report.reportType)}
                </div>
                <p className="font-bold text-sm uppercase tracking-widest">No images available</p>
              </div>
            )}
            
            {/* Quick Actions Overlay */}
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className={cn(
                "px-3 py-1 rounded-lg uppercase text-[10px] font-black tracking-tight flex items-center gap-1.5 border-2",
                getTypeStyles(report.reportType)
              )}>
                {getTypeIcon(report.reportType)}
                {report.reportType}
              </Badge>
            </div>
          </div>

          {/* Right Side: Details */}
          <div className="lg:w-1/2 flex flex-col bg-white">
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={report.user?.profilePicture || undefined} 
                    className="w-10 h-10 border-2 border-slate-50 text-xs font-black bg-teal-50 text-teal-600"
                  >
                    {report.user?.username?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-black text-slate-800">{report.user?.fullName || report.user?.username}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Contributor</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <Clock size={12} />
                  {new Date(report.dateCreated).toLocaleDateString()}
                </div>
              </div>

              <h2 className="text-3xl font-black text-slate-900 leading-tight mb-4 uppercase italic">
                {report.title}
              </h2>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-4 h-[2px] bg-teal-600 rounded-full" />
                    Description
                  </h4>
                  <p
                    className="text-slate-600 font-medium leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatSimpleMarkdown(report.description) }}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4">
                  {report.location && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <MapPin size={12} className="text-teal-600" />
                        Location
                      </h4>
                      <p className="text-sm font-bold text-slate-700">{report.location}</p>
                    </div>
                  )}
                  
                  {report.contactInfo && (
                    <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100">
                       <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Phone size={12} />
                        Contact Information
                      </h4>
                      <p className="text-sm font-bold text-teal-700">{report.contactInfo}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-white rounded-b-[2.5rem]">
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-slate-400 hover:text-teal-600 transition-colors group">
                  <Heart size={20} className={cn("group-hover:fill-teal-600 transition-all", report.isReacted && "fill-teal-600 text-teal-600")} />
                  <span className="text-sm font-black">{report.reactionsCount || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors group">
                  <MessageSquare size={20} className="group-hover:fill-blue-600/10 transition-all" />
                  <span className="text-sm font-black">{report.commentsCount || 0}</span>
                </button>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-xl border-slate-200 hover:bg-slate-50"
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                  }}
                >
                  <Share2 size={18} />
                </Button>
                <Button 
                  onClick={onClose}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-black px-6 rounded-xl uppercase text-xs tracking-widest"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDetailModal;
