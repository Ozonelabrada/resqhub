import { useState, useCallback } from 'react';

/**
 * Hook to manage event-related actions (RSVP, check-in, favorite, etc)
 * <60 lines - handles event interaction state
 */
export const useEventActions = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const handleCheckIn = useCallback(() => {
    // TODO: Call API to check-in user
    setIsCheckedIn(true);
    setShowCheckInModal(false);
  }, []);

  const handleRSVP = useCallback(async () => {
    // TODO: Call API to RSVP to event
    console.log('RSVP clicked');
  }, []);

  const handleStartEvent = useCallback(async () => {
    // TODO: Call API to start event (for creator only)
    console.log('Start event clicked');
  }, []);

  const handleFavorite = useCallback(() => {
    setIsFavorite(!isFavorite);
    // TODO: Call API to save/remove favorite
  }, [isFavorite]);

  const handleShare = useCallback(() => {
    // TODO: Implement share functionality
    console.log('Share clicked');
  }, []);

  return {
    isCheckedIn,
    setIsCheckedIn,
    isFavorite,
    setIsFavorite,
    showCheckInModal,
    setShowCheckInModal,
    showQRModal,
    setShowQRModal,
    handleCheckIn,
    handleRSVP,
    handleStartEvent,
    handleFavorite,
    handleShare,
  };
};
