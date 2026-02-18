import { useState, useEffect } from 'react';

export interface EventAttendee {
  id: string;
  fullName: string;
  avatar?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  role?: 'organizer' | 'volunteer' | 'participant';
}

export interface EventObjective {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface EventComment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  createdAt: string;
  likes?: number;
}

export interface EventScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
}

export interface EventResource {
  id: string;
  name: string;
  url: string;
  type: 'document' | 'image' | 'video' | 'file';
}

export interface EventFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface EventSponsor {
  id: string;
  name: string;
  logo?: string;
  website?: string;
}

export interface EventStatistics {
  overview?: {
    capacity?: number;
    rsvpCount?: number;
    checkedInCount?: number;
    totalViews?: number;
    avgRating?: number;
    satisfactionPercent?: number;
    engagementScore?: number;
  };
  schedule?: {
    sessionsCount?: number;
    upcomingSessions?: number;
    completedSessions?: number;
  };
  gallery?: {
    photosCount?: number;
    videosCount?: number;
  };
  attendees?: {
    total?: number;
    checkedIn?: number;
    organizers?: number;
    volunteers?: number;
    participants?: number;
    diversity?: Record<string, number>;
  };
  objectives?: {
    total?: number;
    completed?: number;
    progressPercent?: number;
  };
  discussion?: {
    commentsCount?: number;
    recentActivity?: number;
  };
  resources?: {
    total?: number;
    downloads?: number;
  };
  faq?: {
    total?: number;
  };
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
  stats?: EventStatistics;
}

import { CommunityService } from '@/services/communityService';

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
        // helper to compute simple stats from mock data
        const attendees: EventAttendee[] = [
          { id: '1', fullName: 'Sarah Johnson', checkedIn: false, role: 'organizer' },
          { id: '2', fullName: 'John Doe', checkedIn: false, role: 'participant' },
          { id: '3', fullName: 'Maria Smith', checkedIn: true, checkedInAt: '2025-03-15T08:05:00', role: 'volunteer' },
        ];

        const objectives = [
          { id: '1', title: 'Clean Central Park', description: 'Remove all litter and debris from the park area', completed: false },
          { id: '2', title: 'Plant Trees', description: 'Plant 50 new trees in designated areas', completed: false },
          { id: '3', title: 'Paint Benches', description: 'Paint and refurbish community benches', completed: false },
        ];

        const schedule = [
          { id: '1', time: '08:00 AM', title: 'Registration & Welcome', description: 'Check-in and meet the team' },
          { id: '2', time: '08:30 AM', title: 'Safety Briefing', description: 'Learn about safety protocols' },
          { id: '3', time: '09:00 AM', title: 'Group Cleanup', description: 'Cleanup begins - all teams mobilize' },
          { id: '4', time: '11:00 AM', title: 'Break & Refreshments', description: 'Coffee and snacks provided' },
          { id: '5', time: '11:30 AM', title: 'Final Push', description: 'Complete remaining tasks' },
          { id: '6', time: '12:00 PM', title: 'Closing & Awards', description: 'Thank you celebration' },
        ];

        const gallery = [
          'https://via.placeholder.com/400x300?text=Event+Photo+1',
          'https://via.placeholder.com/400x300?text=Event+Photo+2',
          'https://via.placeholder.com/400x300?text=Event+Photo+3',
          'https://via.placeholder.com/400x300?text=Event+Photo+4',
        ];

        const resources: EventResource[] = [
          { id: '1', name: 'Event Waiver Form', url: '#', type: 'document' },
          { id: '2', name: 'Sustainability Guide', url: '#', type: 'document' },
          { id: '3', name: 'Equipment Checklist', url: '#', type: 'file' },
        ];

        const faqs = [
          { id: '1', question: 'What should I bring?', answer: 'Please bring: comfortable clothes, closed-toe shoes, water bottle, sunscreen, and gloves. We provide trash bags and tools.' },
          { id: '2', question: 'Is this event suitable for families?', answer: 'Yes! We welcome families. Children under 12 must be accompanied by an adult.' },
          { id: '3', question: 'Do I need to register in advance?', answer: 'No, but RSVP helps us plan better. Walk-ins are welcome!' },
          { id: '4', question: 'What if it rains?', answer: 'The event will proceed unless there is severe weather. Check our updates on the morning of the event.' },
        ];

        const comments = [
          { id: '1', author: 'Alex Chen', avatar: 'AC', content: 'Excited to volunteer for this event! Looking forward to making a difference.', createdAt: '2 days ago', likes: 5 },
          { id: '2', author: 'Emma Wilson', avatar: 'EW', content: 'Great initiative! Count me in. Will bring my family too.', createdAt: '1 day ago', likes: 3 },
        ];

        const capacity = 100;
        const rsvpCount = 45;

        const stats = {
          overview: {
            capacity,
            rsvpCount,
            checkedInCount: attendees.filter(a => a.checkedIn).length,
            totalViews: 1240,
            avgRating: 4.6,
            satisfactionPercent: 91,
            engagementScore: 78
          },
          schedule: {
            sessionsCount: schedule.length,
            upcomingSessions: schedule.length, // mock
            completedSessions: 0
          },
          gallery: {
            photosCount: gallery.length,
            videosCount: 0
          },
          attendees: {
            total: attendees.length,
            checkedIn: attendees.filter(a => a.checkedIn).length,
            organizers: attendees.filter(a => a.role === 'organizer').length,
            volunteers: attendees.filter(a => a.role === 'volunteer').length,
            participants: attendees.filter(a => a.role === 'participant').length,
            diversity: { locations: 3 }
          },
          objectives: {
            total: objectives.length,
            completed: objectives.filter(o => o.completed).length,
            progressPercent: Math.round((objectives.filter(o => o.completed).length / Math.max(1, objectives.length)) * 100)
          },
          discussion: {
            commentsCount: comments.length,
            recentActivity: comments.length
          },
          resources: {
            total: resources.length,
            downloads: 0
          },
          faq: {
            total: faqs.length
          }
        } as const;

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
          attendees,
          objectives,
          schedule,
          gallery,
          resources,
          faqs,
          sponsors: [
            { id: '1', name: 'Green Earth Foundation', logo: 'https://via.placeholder.com/150?text=Sponsor+1' },
            { id: '2', name: 'Community Care Co.', logo: 'https://via.placeholder.com/150?text=Sponsor+2' },
          ],
          comments,
          capacity,
          rsvpCount,
          qrCode: 'https://via.placeholder.com/200?text=QR+CODE',
          // seed with computed stats as fallback while we try to fetch real stats
          stats
        });

        // Fetch real statistics from backend and merge if available
        try {
          const statsResult = await CommunityService.getEventStatistics(communityId!, eventId!);
          if (statsResult.success && statsResult.data) {
            const returnedStats = statsResult.data.stats ?? statsResult.data;
            setEvent(prev => prev ? ({ ...prev, stats: returnedStats }) : prev);
          }
        } catch (err) {
          // keep fallback/mock stats on error
          console.warn('Event statistics fetch failed, using fallback stats', err);
        }
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
