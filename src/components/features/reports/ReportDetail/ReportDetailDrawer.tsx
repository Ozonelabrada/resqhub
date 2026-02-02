import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Phone, 
  ExternalLink, 
  ShieldAlert,
  AlertCircle,
  Copy,
  Check,
  Building,
  Pin,
  Trash2,
  CheckCircle,
  Edit3
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  Button,
  Avatar,
  ShadcnBadge as Badge,
  ScrollArea,
  Skeleton
} from '@/components/ui';
import { useReportDetail } from '@/hooks/useReportDetail';
import ImageCarousel from './ImageCarousel';
import ActionsToolbar from './ActionsToolbar';
import CommentSection from '@/components/features/comments/CommentSection';
import { ReportProfileModal } from '@/components/modals/ReportProfileModal';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils';
import { cn } from '@/lib/utils';

interface ReportDetailDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  reportId?: string | number;
}

const ReportDetailDrawer: React.FC<ReportDetailDrawerProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  reportId: propReportId
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const id = propReportId || paramId;
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const { report, loading, error } = useReportDetail(id ? String(id) : undefined);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;

  const isAdmin = user?.role !== undefined && 
    (String(user.role).toLowerCase() === 'admin' || String(user.role) === '1');

  useEffect(() => {
    if (paramId) {
      setInternalIsOpen(true);
    } else if (!propIsOpen) {
      setInternalIsOpen(false);
    }
  }, [paramId, propIsOpen]);

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      setInternalIsOpen(false);
      // Navigate back or to /hub if no history
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/hub');
      }
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!id && !isOpen) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent 
          side="right" 
          className="p-0 sm:max-w-[500px] lg:max-w-[650px] flex flex-col h-full bg-white border-l"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{report?.title || 'Report Detail'}</SheetTitle>
            <SheetDescription>
              {report?.description || 'Detailed information about the report'}
            </SheetDescription>
          </SheetHeader>

          {loading ? (
            <div className="flex flex-col h-full">
              <div className="h-72 w-full bg-slate-100 animate-pulse" />
              <div className="p-6 space-y-4 flex-1">
                <Skeleton className="h-8 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-24 w-full" />
                <div className="space-y-2 pt-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50">
              <div className="p-3 bg-red-50 rounded-full mb-4">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Report Not Found</h3>
              <p className="text-slate-500 mb-6">
                This report might have been removed or is no longer available.
              </p>
              <Button onClick={handleClose}>Go Back</Button>
            </div>
          ) : report ? (
            <ScrollArea className="flex-1">
              {/* Media Area */}
              <ImageCarousel images={report.images} title={report.title} />

              <div className="p-6 space-y-6">
                {/* Header Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={cn(
                      "font-semibold",
                      report.reportType?.toLowerCase() === 'lost' ? "text-orange-600 bg-orange-50 border-orange-200" :
                      report.reportType?.toLowerCase() === 'found' ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
                      "text-teal-600 bg-teal-50 border-teal-200"
                    )}>
                      {report.reportType}
                    </Badge>
                    {report.categoryName && (
                      <Badge variant="outline" className="text-slate-500">
                        {report.categoryName}
                      </Badge>
                    )}
                    {report.isFeatured && (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                        Featured
                      </Badge>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                    {report.title}
                  </h2>

                  <div className="flex items-center justify-between text-sm text-slate-500 pt-1">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDate(report.dateCreated)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {report.location}
                      </div>
                    </div>
                    {report.viewsCount !== undefined && (
                      <div className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                        {report.viewsCount} views
                      </div>
                    )}
                  </div>
                </div>

                {/* Reporter Profile */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Avatar src={report.user?.profilePictureUrl} alt={report.user?.fullName} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {report.user?.fullName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      @{report.user?.username}
                    </p>
                  </div>
                  {report.communityId ? (
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                        <Building className="h-3 w-3" />
                        Community
                      </div>
                      <Badge variant="secondary" className="bg-teal-100 text-teal-700 hover:bg-teal-200 border-none text-[11px]">
                        {report.communityName}
                      </Badge>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setIsProfileModalOpen(true)}
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs font-semibold"
                    >
                      View Profile
                    </Button>
                  )}
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Admin Controls</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" className="bg-slate-800 border-none hover:bg-slate-700 text-white font-bold gap-2">
                        <Pin className="h-3.5 w-3.5" /> Pin
                      </Button>
                      <Button variant="secondary" size="sm" className="bg-slate-800 border-none hover:bg-slate-700 text-white font-bold gap-2">
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button variant="secondary" size="sm" className="bg-slate-800 border-none hover:bg-slate-700 text-white font-bold gap-2">
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button variant="secondary" size="sm" className="bg-red-900/50 border-none hover:bg-red-900 text-red-200 font-bold gap-2">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Description
                  </h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {report.description}
                  </p>
                </div>

                {/* Reward Details */}
                {report.rewardDetails && (
                  <div className="p-4 rounded-xl bg-teal-50 border border-teal-100 space-y-2">
                    <h3 className="text-sm font-bold text-teal-700 uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      Reward Details
                    </h3>
                    <p className="text-teal-800 font-medium">
                      {report.rewardDetails}
                    </p>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 text-slate-600 overflow-hidden">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{report.contactInfo}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => copyToClipboard(report.contactInfo, 'phone')}
                      >
                        {copiedField === 'phone' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                    {/* Map Link */}
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center gap-2 h-auto py-3 bg-white border-slate-200 text-slate-700"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(report.location)}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in Maps
                    </Button>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <ActionsToolbar 
                  reportId={report.id}
                  reactionsCount={report.reactionsCount}
                  commentsCount={report.commentsCount}
                  onCommentClick={() => {}}
                  onShareClick={() => {}}
                  onReportClick={() => {}}
                />

                {/* Comments Section */}
                <div className="pt-2">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    Comments
                    <Badge variant="secondary" className="rounded-full h-5 px-1.5 min-w-[20px] flex items-center justify-center text-[10px]">
                      {report.commentsCount}
                    </Badge>
                  </h3>
                  <CommentSection 
                    itemId={report.id} 
                    itemType={report.reportType?.toLowerCase() === 'found' ? 'found' : 'lost'}
                    itemOwnerId={Number(report.userId)}
                  />
                </div>
              </div>
            </ScrollArea>
          ) : null}
        </SheetContent>
      </Sheet>

      <ReportProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={report?.user ? {
          fullName: report.user.fullName,
          profilePicture: report.user.profilePictureUrl,
          address: (report.user as any).address,
          sex: (report.user as any).sex,
          age: (report.user as any).age
        } : null}
      />
    </>
  );
};

export default ReportDetailDrawer;
