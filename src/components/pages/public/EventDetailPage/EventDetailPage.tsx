import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, AlertCircle } from 'lucide-react';
import { Button, Card, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import EventOverview from './components/EventOverview';
import EventSchedule from './components/EventSchedule';
import EventGallery from './components/EventGallery';
import EventAttendees from './components/EventAttendees';
import EventObjectives from './components/EventObjectives';
import EventDiscussion from './components/EventDiscussion';
import EventResources from './components/EventResources';
import EventFAQ from './components/EventFAQ';
import EventDetailsCard from './components/EventDetailsCard';
import EventCountdownCard from './components/EventCountdownCard';
import EventSponsorsCard from './components/EventSponsorsCard';
import EventCreatorCard from './components/EventCreatorCard';
import CheckInModal from './components/CheckInModal';
import QRModal from './components/QRModal';
import { useEventData } from './hooks/useEventData';
import { useEventCountdown } from './hooks/useEventCountdown';
import { useEventActions } from './hooks/useEventActions';
import { useCommunityDetail } from '@/hooks/useCommunities';

const EventDetailPage: React.FC = () => {
  const { id: communityId, eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { event, loading, error } = useEventData(communityId, eventId);
  const { community } = useCommunityDetail(communityId);
  const timeRemaining = useEventCountdown(event?.startDate, event?.startTime);
  const {
    isCheckedIn,
    isFavorite,
    isRsvpd,
    showCheckInModal,
    showQRModal,
    selectedTab,
    handleCheckIn,
    handleConfirmCheckIn,
    handleStartEvent,
    handleRSVP,
    handleFavorite,
    handleShare,
    setSelectedTab,
    setShowCheckInModal,
    setShowQRModal,
  } = useEventActions();

  const handleQRCodeClick = () => setShowQRModal(true);
  const handleCheckInSuccess = (memberId: string, memberName: string) => {
    handleConfirmCheckIn();
    // TODO: Call API to mark member as checked in
    console.log(`Checked in: ${memberName}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Card className="p-8 max-w-md rounded-[2.5rem]">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 text-center font-medium">{error || 'Event not found'}</p>
          <Button
            onClick={() => navigate(-1)}
            className="w-full mt-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const isEventCreator = user?.id === event?.user?.id;
  const isCommunityAdmin = community?.isAdmin || false;
  const isModerator = community?.isModerator || false;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in-progress':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'completed':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="w-full px-4 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Events
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleFavorite}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-300",
                isFavorite
                  ? "bg-red-100 text-red-600"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden bg-white">
        {/* Banner */}
        <div className="w-full h-96 bg-gradient-to-br from-teal-400 to-teal-600 overflow-hidden relative">
          {event?.banner && (
            <img src={event.banner} alt={event?.title} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
            <div className="w-full px-4 lg:px-8 lg:px-12 pb-8">
              <div className={cn("mb-4 rounded-xl font-black text-[10px] border px-3 py-1 inline-block", getStatusColor(event.status))}>
                {event?.status.toUpperCase()}
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-white mb-3 drop-shadow-lg max-w-4xl">{event?.title}</h1>
              <p className="text-white/90 font-semibold max-w-3xl drop-shadow text-lg">{event?.description}</p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="w-full px-4 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full mx-auto">
            {/* Left Column - Tabs */}
            <div className="lg:col-span-2 space-y-6 order-1">
              <div className="bg-white rounded-[2.5rem] p-4 md:p-6 border border-slate-100 overflow-x-hidden">
                <div className="flex gap-2 md:gap-4 border-b border-slate-100 mb-6 flex-wrap pb-2">
                  {(['overview', 'schedule', 'gallery', 'attendees', 'objectives', 'discussion', 'resources', 'faq'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedTab(tab)}
                      className={cn(
                        'px-3 md:px-6 py-3 font-bold text-xs md:text-sm uppercase transition-all rounded-t-xl whitespace-nowrap',
                        selectedTab === tab
                          ? 'text-teal-600 border-b-2 border-teal-600'
                          : 'text-slate-500 hover:text-slate-700'
                      )}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {selectedTab === 'overview' && <EventOverview event={event} />}
                {selectedTab === 'schedule' && <EventSchedule event={event} />}
                {selectedTab === 'gallery' && <EventGallery event={event} />}
                {selectedTab === 'attendees' && (
                  <EventAttendees
                    event={event}
                    isEventCreator={isEventCreator}
                    onCheckInClick={handleCheckIn}
                  />
                )}
                {selectedTab === 'objectives' && <EventObjectives event={event} isEventCreator={isEventCreator} />}
                {selectedTab === 'discussion' && <EventDiscussion event={event} userFullName={user?.fullName} />}
                {selectedTab === 'resources' && <EventResources event={event} />}
                {selectedTab === 'faq' && <EventFAQ event={event} />}
              </div>
            </div>

            {/* Right Column - Sidebar Cards */}
            <div className="lg:col-span-1 space-y-4 order-2 lg:order-none">
              <EventDetailsCard event={event} />
              {timeRemaining && event?.status === 'upcoming' && (
                <EventCountdownCard event={event} timeRemaining={timeRemaining} />
              )}
              {event?.sponsors && event.sponsors.length > 0 && <EventSponsorsCard event={event} />}
              <EventCreatorCard
                event={event}
                isEventCreator={isEventCreator}
                isCommunityAdmin={isCommunityAdmin}
                isCheckedIn={isCheckedIn}
                isRsvpd={isRsvpd}
                isFavorite={isFavorite}
                onStartEvent={handleStartEvent}
                onCheckIn={handleCheckIn}
                onRSVP={handleRSVP}
                onFavorite={handleFavorite}
                onQRCode={handleQRCodeClick}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {event && showCheckInModal && (
        <CheckInModal
          event={event}
          onConfirm={handleConfirmCheckIn}
          onClose={() => setShowCheckInModal(false)}
        />
      )}
      {showQRModal && (
        <QRModal
          qrCode={event?.qrCode}
          onClose={() => setShowQRModal(false)}
          isAdmin={isCommunityAdmin || isEventCreator}
          isModerator={isModerator}
          userId={user?.id}
          userName={user?.fullName || user?.name}
          eventId={eventId}
          hasRsvpd={isRsvpd}
          onCheckInSuccess={handleCheckInSuccess}
        />
      )}
    </div>
  );
};

export default EventDetailPage;
