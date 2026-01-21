import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  ShadcnSelect as Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem,
  Spinner,
  Alert
} from '../../ui';
import { Megaphone, AlertCircle, MapPin, Phone, LinkIcon, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { CommunityService } from '../../../services/communityService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  communityId?: string | number | undefined;
  onSuccess?: () => void;
}

const CreateAnnouncementModal: React.FC<Props> = ({ isOpen, onClose, communityId, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'announcement' | 'news' | 'events'>('announcement');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [reportUrl, setReportUrl] = useState('');
  const [category, setCategory] = useState('community');

  const resetForm = () => {
    setTitle('');
    setContent('');
    setType('announcement');
    setStartDate('');
    setEndDate('');
    setTime('');
    setLocation('');
    setContactInfo('');
    setReportUrl('');
    setCategory('community');
    setError('');
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError(t('community.announcement.validation.titleRequired') || 'Title is required');
      return false;
    }
    if (!content.trim()) {
      setError(t('community.announcement.validation.contentRequired') || 'Description is required');
      return false;
    }
    if (!startDate) {
      setError(t('community.announcement.validation.startDateRequired') || 'Start date is required');
      return false;
    }
    if (!endDate) {
      setError(t('community.announcement.validation.endDateRequired') || 'End date is required');
      return false;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError(t('community.announcement.validation.endDateAfterStart') || 'End date must be after start date');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!communityId) return;
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = await CommunityService.createAnnouncement({
        title,
        description: content,
        startDate,
        endDate,
        reportUrl: reportUrl || '',
        category: 'community',
        type: type as 'announcement' | 'news' | 'events',
        location: location || '',
        contactInfo: contactInfo || '',
        communityId: communityId,
      });

      if (!result.success) {
        setError(result.message || 'Failed to create announcement');
        return;
      }

      resetForm();
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create announcement', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
          <Megaphone className="text-teal-600" size={24} />
        </div>
        <h2 className="text-xl font-black text-slate-900">{t('community.announcement.title') || 'Create Announcement'}</h2>
        <p className="text-slate-500 font-medium text-sm mt-1">{t('community.announcement.description') || 'Share important updates with your community'}</p>
      </ModalHeader>

      <ModalBody className="space-y-4 max-h-[60vh] overflow-y-auto">
        {error && (
          <Alert className="bg-orange-50 border border-orange-200 rounded-2xl">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-800 ml-2 font-bold">{error}</span>
          </Alert>
        )}

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('community.announcement.type') || 'Content Type'}</label>
          <Select onValueChange={(v) => setType(v as 'announcement'|'news'|'events')} value={type}>
            <SelectTrigger className="h-12 rounded-xl border-slate-200 mt-2 bg-slate-50 border-none">
              <SelectValue placeholder={t('community.announcement.type_placeholder')} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl p-2 bg-white">
              <SelectItem value="announcement">{t('community.announcement.item_announcement') || 'Announcement'}</SelectItem>
              <SelectItem value="news">{t('community.announcement.item_news') || 'News'}</SelectItem>
              <SelectItem value="events">{t('community.announcement.item_events') || 'Events'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('community.announcement.label_title') || 'Title'}</label>
          <input 
            value={title} 
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }} 
            className="w-full mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 font-medium h-12 px-4 shadow-sm" 
            placeholder={t('community.announcement.placeholder_title') || 'Enter announcement title'} 
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('community.announcement.label_content') || 'Description'}</label>
          <textarea 
            value={content} 
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError('');
            }} 
            rows={4} 
            className="w-full mt-2 p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 font-medium shadow-sm resize-none" 
            placeholder={t('community.announcement.placeholder_content') || 'Enter detailed description'} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
              <CalendarIcon size={12} /> Start Date
            </label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (error) setError('');
              }}
              className="w-full mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 font-medium h-12 px-4 shadow-sm"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
              <CalendarIcon size={12} /> End Date
            </label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                if (error) setError('');
              }}
              className="w-full mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 font-medium h-12 px-4 shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
            <Clock size={12} /> Time (Optional)
          </label>
          <input 
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 font-medium h-12 px-4 shadow-sm"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
            <MapPin size={12} /> Location (Optional)
          </label>
          <input 
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 font-medium h-12 px-4 shadow-sm"
            placeholder="Enter location"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
            <Phone size={12} /> Contact Info (Optional)
          </label>
          <input 
            type="text"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="w-full mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 font-medium h-12 px-4 shadow-sm"
            placeholder="Enter phone or email"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
            <LinkIcon size={12} /> Report URL (Optional)
          </label>
          <input 
            type="url"
            value={reportUrl}
            onChange={(e) => setReportUrl(e.target.value)}
            className="w-full mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 font-medium h-12 px-4 shadow-sm"
            placeholder="https://example.com"
          />
        </div>
      </ModalBody>

      <ModalFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !title.trim() || !content.trim() || !startDate || !endDate} 
          className="bg-teal-600 hover:bg-teal-700 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-teal-100"
        >
          {loading ? <Spinner size="sm" className="mr-2" /> : null}
          {loading ? (t('community.announcement.button_posting') || 'Posting...') : (t('community.announcement.button_post') || 'Post Announcement')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
export default CreateAnnouncementModal;
