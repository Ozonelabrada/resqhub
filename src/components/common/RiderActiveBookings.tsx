import React, { useEffect, useState } from 'react';
import { useRiderBookings, RiderBooking } from '../../hooks/useRiderBookings';
import { Card, Button, Badge } from '../ui';
import {
  MapPin,
  DollarSign,
  Clock,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck
} from 'lucide-react';

interface RiderActiveBookingsProps {
  onBookingAccepted?: (booking: RiderBooking) => void;
  onBookingDenied?: (booking: RiderBooking) => void;
  autoPlaySound?: boolean;
  showNotificationBadge?: boolean;
}

/**
 * Real-time Rider Active Bookings Component
 * 
 * This component displays bookings assigned to riders in real-time via SignalR
 * New bookings appear immediately without requiring page refresh
 * 
 * Features:
 * - Real-time booking display (no delay)
 * - Accept/Deny buttons with immediate feedback
 * - New booking notification badge
 * - Sound alert for new bookings (optional)
 * - Shows booking details (location, amount, customer info)
 * - Auto-removes completed/cancelled bookings
 */
export const RiderActiveBookings: React.FC<RiderActiveBookingsProps> = ({
  onBookingAccepted,
  onBookingDenied,
  autoPlaySound = true,
  showNotificationBadge = true
}) => {
  const { 
    activeBookings, 
    acceptBooking, 
    denyBooking, 
    isNewBooking, 
    getNewBookingCount,
    clearNewBookingNotification,
    loading, 
    error 
  } = useRiderBookings();

  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [denyingId, setDenyingId] = useState<string | null>(null);

  // Play sound and show notification for new bookings
  useEffect(() => {
    const newBookings = activeBookings.filter(b => isNewBooking(b.BookingId));
    
    if (newBookings.length > 0) {
      // Play sound if enabled
      if (autoPlaySound) {
        playNotificationSound();
      }

      // Log for debugging
      console.log(`🔔 ${newBookings.length} new booking(s) received`);
    }
  }, [activeBookings, isNewBooking, autoPlaySound]);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Play a pleasant notification tone
      oscillator.frequency.value = 800; // Frequency in Hz
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification not supported');
    }
  };

  const handleAccept = async (booking: RiderBooking) => {
    setAcceptingId(booking.BookingId);
    try {
      await acceptBooking(booking.BookingId);
      clearNewBookingNotification(booking.BookingId);
      onBookingAccepted?.(booking);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDeny = async (booking: RiderBooking) => {
    setDenyingId(booking.BookingId);
    try {
      await denyBooking(booking.BookingId, 'Rider declined');
      clearNewBookingNotification(booking.BookingId);
      onBookingDenied?.(booking);
    } finally {
      setDenyingId(null);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={20} />
          <span className="font-semibold">Connection Error</span>
        </div>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (activeBookings.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
        <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Active Bookings</h3>
        <p className="text-gray-600">
          New booking requests will appear here instantly when customers place orders
        </p>
      </div>
    );
  }

  const newBookingCount = getNewBookingCount();

  return (
    <div className="space-y-4">
      {/* Header with new booking badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Active Bookings</h2>
        {showNotificationBadge && newBookingCount > 0 && (
          <Badge className="bg-red-500 text-white animate-pulse">
            {newBookingCount} New
          </Badge>
        )}
        <span className="text-sm text-gray-600">
          {activeBookings.length} available
        </span>
      </div>

      {/* Bookings List */}
      <div className="grid gap-4">
        {activeBookings.map((booking) => {
          const isNew = isNewBooking(booking.BookingId);
          const isAccepting = acceptingId === booking.BookingId;
          const isDenying = denyingId === booking.BookingId;

          return (
            <Card
              key={booking.BookingId}
              className={`p-5 border-2 transition-all ${
                isNew
                  ? 'border-green-500 bg-green-50 shadow-lg animate-pulse-subtle'
                  : 'border-gray-200'
              }`}
            >
              {/* New badge */}
              {isNew && (
                <div className="mb-3 flex items-center gap-2">
                  <Badge className="bg-green-500 text-white">NEW</Badge>
                  <span className="text-xs text-green-700 font-medium">
                    Just arrived - tap to accept!
                  </span>
                </div>
              )}

              {/* Booking Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {booking.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {booking.message}
                    </p>
                  </div>
                  <Badge
                    className={`${
                      booking.Status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {booking.Status}
                  </Badge>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white p-3 rounded-lg mb-4 border border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Customer</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Name:</span>{' '}
                    {booking.customerInfo.firstName} {booking.customerInfo.lastName}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-gray-500" />
                    <a
                      href={`tel:${booking.customerInfo.phoneNumber}`}
                      className="text-blue-600 hover:underline"
                    >
                      {booking.customerInfo.phoneNumber}
                    </a>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {booking.bookingDetails.pickupAddress && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 font-medium">Pickup</p>
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {booking.bookingDetails.pickupAddress}
                      </p>
                    </div>
                  </div>
                )}

                {booking.bookingDetails.dropoffAddress && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 font-medium">Dropoff</p>
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {booking.bookingDetails.dropoffAddress}
                      </p>
                    </div>
                  </div>
                )}

                {booking.bookingDetails.estimatedDuration && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock size={18} className="text-orange-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Est. Duration</p>
                      <p className="text-sm text-gray-900 font-medium">
                        {booking.bookingDetails.estimatedDuration} min
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign size={18} className="text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Amount</p>
                    <p className="text-sm text-gray-900 font-medium">
                      ₱{booking.bookingDetails.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleAccept(booking)}
                  disabled={isAccepting || isDenying || loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isAccepting ? (
                    <>
                      <CheckCircle size={16} className="animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Accept
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleDeny(booking)}
                  disabled={isAccepting || isDenying || loading}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                >
                  {isDenying ? (
                    <>
                      <XCircle size={16} className="animate-spin" />
                      Denying...
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      Deny
                    </>
                  )}
                </Button>
              </div>

              {/* Timestamp */}
              <p className="text-xs text-gray-500 mt-3">
                Created: {new Date(booking.Timestamp).toLocaleString()}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RiderActiveBookings;
