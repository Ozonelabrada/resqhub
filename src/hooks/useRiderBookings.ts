import { useEffect, useState, useCallback } from 'react';
import websocketService from '../services/websocketService';

/**
 * Booking data structure received from backend via SignalR
 */
export interface RiderBooking {
  id: string;
  title: string;
  message: string;
  BookingId: string;
  BookingType: string;
  Status: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  bookingDetails: {
    createdAt: string;
    totalAmount: number;
    status: string;
    bookingType: string;
    nextSteps: string;
    pickupAddress?: string;
    dropoffAddress?: string;
    pickupCoordinates?: { lat: number; lng: number };
    dropoffCoordinates?: { lat: number; lng: number };
    estimatedDuration?: number;
    acceptedAt?: string;
  };
  riderInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    rating: number;
    vehicle: string;
    plate: string;
    location: string;
    avatar: string;
  };
  Timestamp: string;
}

/**
 * Hook for riders to listen to real-time booking assignments
 * 
 * This hook:
 * - Listens to BookingCreated and BookingStatusUpdated events from SignalR
 * - Maintains a list of active bookings for the rider
 * - Provides functions to accept/deny bookings
 * - Updates UI in real-time without delay
 * 
 * Usage Example:
 * ```tsx
 * const { activeBookings, acceptBooking, denyBooking, isNewBooking } = useRiderBookings();
 * 
 * // Show notification for new bookings
 * useEffect(() => {
 *   activeBookings.forEach(booking => {
 *     if (isNewBooking(booking.BookingId)) {
 *       showNewBookingAlert(booking);
 *     }
 *   });
 * }, [activeBookings]);
 * ```
 */
export const useRiderBookings = () => {
  const [activeBookings, setActiveBookings] = useState<RiderBooking[]>([]);
  const [newBookingIds, setNewBookingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle incoming booking creation event
   * This fires immediately when backend sends BookingCreated via SignalR
   */
  const handleBookingCreated = useCallback((data: any) => {
    console.log('🔔 New booking received:', data);
    
    const booking: RiderBooking = {
      id: data.BookingId || `booking-${Date.now()}`,
      title: data.title,
      message: data.message,
      BookingId: data.BookingId,
      BookingType: data.BookingType,
      Status: data.Status,
      customerInfo: data.customerInfo,
      bookingDetails: data.bookingDetails,
      riderInfo: data.riderInfo,
      Timestamp: data.Timestamp
    };

    // Add to active bookings
    setActiveBookings(prev => {
      // Avoid duplicates
      const exists = prev.some(b => b.BookingId === booking.BookingId);
      if (exists) return prev;
      return [booking, ...prev]; // Prepend new booking
    });

    // Mark as new for notification purposes
    setNewBookingIds(prev => new Set([...prev, booking.BookingId]));
  }, []);

  /**
   * Handle booking status updates
   */
  const handleBookingStatusUpdated = useCallback((data: any) => {
    console.log('📊 Booking status updated:', data);
    
    setActiveBookings(prev =>
      prev.map(booking =>
        booking.BookingId === data.BookingId
          ? {
              ...booking,
              Status: data.Status,
              bookingDetails: {
                ...booking.bookingDetails,
                ...data.bookingDetails,
                status: data.Status
              },
              riderInfo: data.riderInfo || booking.riderInfo
            }
          : booking
      ).filter(booking => {
        // Remove completed or cancelled bookings
        return !['completed', 'cancelled'].includes(booking.Status?.toLowerCase());
      })
    );
  }, []);

  /**
   * Handle booking cancellation
   */
  const handleBookingCancelled = useCallback((data: any) => {
    console.log('❌ Booking cancelled:', data);
    
    setActiveBookings(prev =>
      prev.filter(booking => booking.BookingId !== data.BookingId)
    );
  }, []);

  /**
   * Accept a booking
   * Send acceptance to backend via WebSocket
   */
  const acceptBooking = useCallback(async (bookingId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Send acceptance via WebSocket
      await websocketService.emit('accept_booking', { bookingId });

      console.log('✅ Booking accepted:', bookingId);
      
      // Remove from new bookings set
      setNewBookingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept booking';
      setError(errorMessage);
      console.error('Error accepting booking:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Deny/Reject a booking
   * Send rejection to backend via WebSocket
   */
  const denyBooking = useCallback(async (bookingId: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Send rejection via WebSocket
      await websocketService.emit('deny_booking', { bookingId, reason });

      console.log('❌ Booking denied:', bookingId);

      // Remove from active bookings
      setActiveBookings(prev =>
        prev.filter(booking => booking.BookingId !== bookingId)
      );

      // Remove from new bookings set
      setNewBookingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deny booking';
      setError(errorMessage);
      console.error('Error denying booking:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if a booking is newly arrived
   */
  const isNewBooking = useCallback((bookingId: string) => {
    return newBookingIds.has(bookingId);
  }, [newBookingIds]);

  /**
   * Clear new booking notification for a booking
   */
  const clearNewBookingNotification = useCallback((bookingId: string) => {
    setNewBookingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(bookingId);
      return newSet;
    });
  }, []);

  /**
   * Get count of new bookings
   */
  const getNewBookingCount = useCallback(() => {
    return newBookingIds.size;
  }, [newBookingIds]);

  // Setup WebSocket event listeners
  useEffect(() => {
    // Listen to booking creation with real-time display
    websocketService.on('booking_created', handleBookingCreated);
    websocketService.on('BookingCreated', handleBookingCreated);

    // Listen to booking status updates
    websocketService.on('booking_status_updated', handleBookingStatusUpdated);
    websocketService.on('BookingStatusUpdated', handleBookingStatusUpdated);

    // Listen to booking cancellations
    websocketService.on('booking_cancelled', handleBookingCancelled);
    websocketService.on('BookingCancelled', handleBookingCancelled);

    // Cleanup on unmount
    return () => {
      websocketService.off('booking_created', handleBookingCreated);
      websocketService.off('BookingCreated', handleBookingCreated);
      websocketService.off('booking_status_updated', handleBookingStatusUpdated);
      websocketService.off('BookingStatusUpdated', handleBookingStatusUpdated);
      websocketService.off('booking_cancelled', handleBookingCancelled);
      websocketService.off('BookingCancelled', handleBookingCancelled);
    };
  }, [handleBookingCreated, handleBookingStatusUpdated, handleBookingCancelled]);

  return {
    // State
    activeBookings,
    newBookingIds,
    loading,
    error,

    // Methods
    acceptBooking,
    denyBooking,
    isNewBooking,
    clearNewBookingNotification,
    getNewBookingCount
  };
};
