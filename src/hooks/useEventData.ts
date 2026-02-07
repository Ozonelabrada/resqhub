import { useState, useEffect } from 'react';

interface EventAttendee {
  id: string;
  fullName: string;
  avatar?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  role?: 'organizer' | 'volunteer' | 'participant';
}

interface EventObjective {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface EventComment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  createdAt: string;
  likes?: number;
}

interface EventScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
}

interface EventResource {
  id: string;
  name: string;
  url: string;
  type: 'document' | 'image' | 'video' | 'file';
}

interface EventFAQ {
  id: string;
  question: string;
  answer: string;
}

interface EventSponsor {
  id: string;
  name: string;
  logo?: string;
  website?: string;
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  contactInfo: string;
  privacy: 'public' | 'internal';
  categoryName: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  user: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  attendees: EventAttendee[];
  objectives: EventObjective[];
  capacity?: number;
  rsvpCount?: number;
  banner?: string;
  qrCode?: string;
  gallery?: string[];
  schedule?: EventScheduleItem[];
  resources?: EventResource[];
  faqs?: EventFAQ[];
  sponsors?: EventSponsor[];
  comments?: EventComment[];
  ticketPrice?: number;
}

/**
 * Hook to fetch and manage event data
 * <70 lines - handles API calls and state
 */
export const useEventData = (communityId?: string, eventId?: string) => {
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await EventService.getEventDetails(communityId, eventId);
        // setEvent(response);

        // Mock data for demonstration
        setEvent({
          id: eventId || '1',
          title: 'Community Cleanup Drive',
          description: 'Join us for a neighborhood-wide cleanup initiative to beautify our community. We will clean parks, streets, and community spaces. All volunteers are welcome!',
          startDate: '2025-03-15',
          startTime: '08:00',
          endDate: '2025-03-15',
          endTime: '12:00',
          location: 'Central Park, Community Avenue',
          contactInfo: '+1 (555) 123-4567',
          privacy: 'public',
          categoryName: 'Volunteer',
          status: 'in-progress',
          ticketPrice: 0,
          user: {
            id: '1',
            fullName: 'Sarah Johnson',
            avatar: 'SJ',
          },
          attendees: [
            { id: '1', fullName: 'Sarah Johnson', checkedIn: false, role: 'organizer' },
            { id: '2', fullName: 'John Doe', checkedIn: false, role: 'participant' },
            { id: '3', fullName: 'Maria Smith', checkedIn: true, checkedInAt: '2025-03-15T08:05:00', role: 'volunteer' },
          ],
          objectives: [
            { id: '1', title: 'Clean Central Park', description: 'Remove all litter and debris from the park area', completed: false },
            { id: '2', title: 'Plant Trees', description: 'Plant 50 new trees in designated areas', completed: false },
            { id: '3', title: 'Paint Benches', description: 'Paint and refurbish community benches', completed: false },
          ],
          schedule: [
            { id: '1', time: '08:00 AM', title: 'Registration & Welcome', description: 'Check-in and meet the team' },
            { id: '2', time: '08:30 AM', title: 'Safety Briefing', description: 'Learn about safety protocols' },
            { id: '3', time: '09:00 AM', title: 'Group Cleanup', description: 'Cleanup begins - all teams mobilize' },
            { id: '4', time: '11:00 AM', title: 'Break & Refreshments', description: 'Coffee and snacks provided' },
            { id: '5', time: '11:30 AM', title: 'Final Push', description: 'Complete remaining tasks' },
            { id: '6', time: '12:00 PM', title: 'Closing & Awards', description: 'Thank you celebration' },
          ],
          gallery: [
            'https://via.placeholder.com/400x300?text=Event+Photo+1',
            'https://via.placeholder.com/400x300?text=Event+Photo+2',
            'https://via.placeholder.com/400x300?text=Event+Photo+3',
            'https://via.placeholder.com/400x300?text=Event+Photo+4',
          ],
          resources: [
            { id: '1', name: 'Event Waiver Form', url: '#', type: 'document' },
            { id: '2', name: 'Sustainability Guide', url: '#', type: 'document' },
            { id: '3', name: 'Equipment Checklist', url: '#', type: 'file' },
          ],
          faqs: [
            { id: '1', question: 'What should I bring?', answer: 'Please bring: comfortable clothes, closed-toe shoes, water bottle, sunscreen, and gloves. We provide trash bags and tools.' },
            { id: '2', question: 'Is this event suitable for families?', answer: 'Yes! We welcome families. Children under 12 must be accompanied by an adult.' },
            { id: '3', question: 'Do I need to register in advance?', answer: 'No, but RSVP helps us plan better. Walk-ins are welcome!' },
            { id: '4', question: 'What if it rains?', answer: 'The event will proceed unless there is severe weather. Check our updates on the morning of the event.' },
          ],
          sponsors: [
            { id: '1', name: 'Green Earth Foundation', logo: 'https://via.placeholder.com/150?text=Sponsor+1' },
            { id: '2', name: 'Community Care Co.', logo: 'https://via.placeholder.com/150?text=Sponsor+2' },
          ],
          comments: [
            { id: '1', author: 'Alex Chen', avatar: 'AC', content: 'Excited to volunteer for this event! Looking forward to making a difference.', createdAt: '2 days ago', likes: 5 },
            { id: '2', author: 'Emma Wilson', avatar: 'EW', content: 'Great initiative! Count me in. Will bring my family too.', createdAt: '1 day ago', likes: 3 },
          ],
          capacity: 100,
          rsvpCount: 45,
          qrCode: 'https://via.placeholder.com/200?text=QR+CODE',
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch event:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    if (communityId && eventId) {
      fetchEventData();
    }
  }, [communityId, eventId]);

  return { event, loading, error, setEvent };
};
