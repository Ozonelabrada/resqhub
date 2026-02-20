import React from 'react';
import { EventData } from '../hooks/useEventData';
import { Card, Badge } from '@/components/ui';
import { 
  Zap, 
  Star, 
  Users, 
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatSimpleMarkdown } from '@/utils/validation';

interface EventOverviewProps {
  event: EventData;
}

/**
 * Event overview tab component
 * Displays event description, stats, features, and match compatibility
 */
const EventOverview: React.FC<EventOverviewProps> = ({ event }) => {
  // Placeholder event features that can be populated from backend
  const eventFeatures = [
    { name: 'Live Streaming', icon: '📡', available: false },
    { name: 'Q&A Session', icon: '💬', available: false },
    { name: 'Networking', icon: '🤝', available: false },
    { name: 'Certificates', icon: '📜', available: false },
  ];

  // Placeholder match data
  const matchData = {
    score: '--',
    category: '--',
    location: '--',
    size: '--',
  };

  return (
    <div className="space-y-8">
      {/* About Section */}
      <div>
        <h3 className="text-lg font-black text-slate-800 mb-3">About This Event</h3>
        <p className="text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatSimpleMarkdown(event?.description) }} />
      </div>

      {/* Key Stats */}
      <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
        <div className="text-center">
          <p className="text-3xl font-black text-teal-600">{event?.stats?.overview?.capacity ?? event?.capacity ?? 'N/A'}</p>
          <p className="text-xs font-bold text-slate-500 uppercase mt-1">Capacity</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black text-blue-600">{event?.stats?.overview?.rsvpCount ?? event?.rsvpCount ?? 0}</p>
          <p className="text-xs font-bold text-slate-500 uppercase mt-1">RSVPs</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black text-green-600">{event?.stats?.overview?.checkedInCount ?? event?.attendees?.filter(a => a.checkedIn).length ?? 0}</p>
          <p className="text-xs font-bold text-slate-500 uppercase mt-1">Checked In</p>
        </div>
      </div>

      {/* Event Features */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white">
            <Zap size={20} />
          </div>
          <h3 className="text-lg font-black text-slate-900">Event Features</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {eventFeatures.map((feature, idx) => (
            <div 
              key={idx}
              className={cn(
                "p-4 rounded-xl border-2 text-center transition-all",
                feature.available 
                  ? "bg-white border-teal-200 hover:border-teal-400 cursor-pointer" 
                  : "bg-slate-100 border-slate-200 opacity-50"
              )}
            >
              <p className="text-2xl mb-2">{feature.icon}</p>
              <p className="text-xs font-bold text-slate-700">{feature.name}</p>
              {feature.available && (
                <div className="flex justify-center mt-2">
                  <CheckCircle2 size={14} className="text-green-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Event Match Compatibility */}
      <Card className="p-6 bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white">
            <Star size={20} />
          </div>
          <h3 className="text-lg font-black text-slate-900">Event Match Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-5 bg-white rounded-xl border border-teal-100">
            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2">Match Score</p>
            <p className="text-4xl font-black text-slate-800">{matchData.score}</p>
          </div>
          <div className="p-5 bg-white rounded-xl border border-teal-100">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Attendee Compatibility</p>
            <p className="text-4xl font-black text-slate-800">--</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-4 bg-white rounded-xl border border-teal-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</p>
            <p className="text-sm font-black text-slate-800">{matchData.category}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-teal-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</p>
            <p className="text-sm font-black text-slate-800">{matchData.location}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-teal-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attendee Size</p>
            <p className="text-sm font-black text-slate-800">{matchData.size}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-teal-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Engagement</p>
            <p className="text-sm font-black text-slate-800">--</p>
          </div>
        </div>
      </Card>

      {/* Event Specifications */}
      <Card className="p-6 border border-slate-200">
        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp size={18} className="text-teal-600" />
          Event Specifications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-600">Event Type</span>
              <span className="text-sm font-black text-slate-900">--</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-600">Category</span>
              <span className="text-sm font-black text-slate-900">{event?.categoryName || '--'}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-600">Price</span>
              <span className="text-sm font-black text-slate-900">--</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-600">Duration</span>
              <span className="text-sm font-black text-slate-900">--</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-600">Accessibility</span>
              <Badge className="bg-blue-100 text-blue-700 font-bold text-[10px]">--</Badge>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-600">Language</span>
              <span className="text-sm font-black text-slate-900">--</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Engagement Insights */}
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
          <Users size={18} className="text-orange-600" />
          Engagement Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border border-orange-100">
            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-2">Attendee Diversity</p>
            <p className="text-2xl font-black text-slate-800">--</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-orange-100">
            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-2">Avg Rating</p>
            <p className="text-2xl font-black text-slate-800">--</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-orange-100">
            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-2">Satisfaction</p>
            <p className="text-2xl font-black text-slate-800">--</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EventOverview;
