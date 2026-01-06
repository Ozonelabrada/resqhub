/**
 * Mock data for News Feed development and testing
 *
 * This file contains sample NewsFeedItem data to demonstrate the News Feed functionality
 * without requiring backend API calls. The data includes various item types, statuses,
 * and user profiles to showcase different UI states and interactions.
 *
 * Items include:
 * - Lost items (electronics, jewelry, pets)
 * - Found items (wallets, keys, bags, pets)
 * - Reunited items (successful recovery stories)
 *
 * Each item has complete metadata including contact info, rewards, images, and user details.
 */

import type { NewsFeedItem } from '../components/pages/public/PersonalHubPage/personalHub/NewsFeed';

// Mock data for News Feed demonstration
export const mockNewsFeedItems: NewsFeedItem[] = [
  {
    id: '1',
    title: 'Lost iPhone 13 Pro Max - Black',
    category: 'Electronics',
    location: 'Central Park, New York',
    currentLocation: '',
    date: '2024-01-15T14:30:00Z',
    time: '2:30 PM',
    status: 'lost',
    views: 245,
    type: 'lost',
    description: 'Lost my black iPhone 13 Pro Max near the Bethesda Fountain. It has a blue case with a small crack on the back. Very important personal data inside.',
    circumstances: 'Was sitting on a bench when I got up to take a photo. Must have left it behind.',
    identifyingFeatures: 'Black iPhone with blue silicone case, small crack on back cover, screen protector with bubble near top',
    condition: 'good',
    handoverPreference: 'meet',
    contactInfo: {
      name: 'Sarah Johnson',
      phone: '+1-555-0123',
      email: 'sarah.j@email.com',
      preferredContact: 'phone'
    },
    reward: {
      amount: 100,
      description: 'Will pay $100 reward for safe return'
    },
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400'
    ],
    storageLocation: '',
    createdAt: '2024-01-15T15:00:00Z',
    updatedAt: '2024-01-15T15:00:00Z',
    expiresAt: '2024-02-15T15:00:00Z',
    reportTypeDescription: 'Lost Item',
    verificationStatus: 'pending',
    potentialMatches: 3,
    user: {
      id: 'user1',
      fullName: 'Sarah Johnson',
      username: 'sarahj',
      profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      isVerified: true
    },
    timeAgo: '2h ago'
  },
  {
    id: '2',
    title: 'Found Wallet - Brown Leather',
    category: 'Accessories',
    location: 'Times Square, New York',
    currentLocation: 'NYPD Precinct 14',
    date: '2024-01-14T18:45:00Z',
    time: '6:45 PM',
    status: 'found',
    views: 189,
    type: 'found',
    description: 'Found a brown leather wallet containing ID, credit cards, and some cash. Please contact to claim.',
    circumstances: 'Found on the ground near the subway entrance',
    identifyingFeatures: 'Brown leather wallet, contains NY driver\'s license for Michael Chen',
    condition: 'good',
    handoverPreference: 'pickup',
    contactInfo: {
      name: 'John Smith',
      phone: '+1-555-0456',
      email: 'john.smith@email.com',
      preferredContact: 'email'
    },
    reward: {
      amount: 0,
      description: ''
    },
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'
    ],
    storageLocation: 'NYPD Precinct 14 - Lost and Found',
    createdAt: '2024-01-14T19:30:00Z',
    updatedAt: '2024-01-14T19:30:00Z',
    expiresAt: '2024-02-14T19:30:00Z',
    reportTypeDescription: 'Found Item',
    verificationStatus: 'verified',
    potentialMatches: 0,
    user: {
      id: 'user2',
      fullName: 'John Smith',
      username: 'johnsmith',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      isVerified: false
    },
    timeAgo: '1d ago'
  },
  {
    id: '3',
    title: 'Lost Golden Retriever - Max',
    category: 'Pets',
    location: 'Brooklyn Bridge Park',
    currentLocation: '',
    date: '2024-01-13T10:15:00Z',
    time: '10:15 AM',
    status: 'reunited',
    views: 567,
    type: 'lost',
    description: 'Our beloved golden retriever Max got loose during our morning walk. He\'s very friendly and has a red collar with his name tag.',
    circumstances: 'Slipped out of his collar while playing with other dogs',
    identifyingFeatures: 'Golden fur, red collar with "Max" tag, microchip registered',
    condition: 'excellent',
    handoverPreference: 'meet',
    contactInfo: {
      name: 'Emma Davis',
      phone: '+1-555-0789',
      email: 'emma.davis@email.com',
      preferredContact: 'phone'
    },
    reward: {
      amount: 200,
      description: 'Generous reward for Max\'s safe return!'
    },
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'
    ],
    storageLocation: '',
    createdAt: '2024-01-13T11:00:00Z',
    updatedAt: '2024-01-14T16:30:00Z',
    expiresAt: '2024-02-13T11:00:00Z',
    reportTypeDescription: 'Lost Pet',
    verificationStatus: 'verified',
    potentialMatches: 0,
    user: {
      id: 'user3',
      fullName: 'Emma Davis',
      username: 'emmad',
      profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      isVerified: true
    },
    timeAgo: '2d ago'
  },
  {
    id: '4',
    title: 'Found Keys - House and Car',
    category: 'Keys',
    location: 'Union Square, New York',
    currentLocation: 'SHERRA Office',
    date: '2024-01-12T16:20:00Z',
    time: '4:20 PM',
    status: 'found',
    views: 98,
    type: 'found',
    description: 'Found a keyring with house keys and a Toyota car key. Found near the farmers market.',
    circumstances: 'Found on a bench',
    identifyingFeatures: 'Silver keyring, Toyota key, 2 house keys',
    condition: 'good',
    handoverPreference: 'pickup',
    contactInfo: {
      name: 'SHERRA Team',
      phone: '+1-555-0000',
      email: 'team@sherra.com',
      preferredContact: 'email'
    },
    reward: {
      amount: 0,
      description: ''
    },
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400'
    ],
    storageLocation: 'SHERRA Office - 123 Main St, NY',
    createdAt: '2024-01-12T17:00:00Z',
    updatedAt: '2024-01-12T17:00:00Z',
    expiresAt: '2024-02-12T17:00:00Z',
    reportTypeDescription: 'Found Item',
    verificationStatus: 'verified',
    potentialMatches: 1,
    user: {
      id: 'user4',
      fullName: 'SHERRA Team',
      username: 'sherra',
      profilePicture: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
      isVerified: true
    },
    timeAgo: '3d ago'
  },
  {
    id: '5',
    title: 'Lost Wedding Ring - Platinum',
    category: 'Jewelry',
    location: 'Coney Island Beach',
    currentLocation: '',
    date: '2024-01-11T13:45:00Z',
    time: '1:45 PM',
    status: 'lost',
    views: 312,
    type: 'lost',
    description: 'Lost my wedding ring while building sandcastles with my kids. It\'s a platinum band with small diamonds. Sentimental value is priceless.',
    circumstances: 'Was playing in the sand when I noticed it was gone',
    identifyingFeatures: 'Platinum band, small round diamonds, engraved with our wedding date inside',
    condition: 'excellent',
    handoverPreference: 'meet',
    contactInfo: {
      name: 'David Wilson',
      phone: '+1-555-0321',
      email: 'david.wilson@email.com',
      preferredContact: 'phone'
    },
    reward: {
      amount: 500,
      description: 'Large reward offered for return of this sentimental item'
    },
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'
    ],
    storageLocation: '',
    createdAt: '2024-01-11T14:30:00Z',
    updatedAt: '2024-01-11T14:30:00Z',
    expiresAt: '2024-02-11T14:30:00Z',
    reportTypeDescription: 'Lost Jewelry',
    verificationStatus: 'pending',
    potentialMatches: 2,
    user: {
      id: 'user5',
      fullName: 'David Wilson',
      username: 'davidw',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      isVerified: false
    },
    timeAgo: '4d ago'
  },
  {
    id: '6',
    title: 'Found Backpack - Blue North Face',
    category: 'Bags',
    location: 'Grand Central Station',
    currentLocation: 'Amtrak Lost and Found',
    date: '2024-01-10T12:00:00Z',
    time: '12:00 PM',
    status: 'found',
    views: 156,
    type: 'found',
    description: 'Found a blue North Face backpack with laptop, books, and personal items. Please contact to identify.',
    circumstances: 'Left on a bench in the main concourse',
    identifyingFeatures: 'Blue North Face backpack, contains MacBook Pro, textbooks, wallet',
    condition: 'good',
    handoverPreference: 'pickup',
    contactInfo: {
      name: 'Amtrak Staff',
      phone: '+1-555-1111',
      email: 'lostfound@amtrak.com',
      preferredContact: 'email'
    },
    reward: {
      amount: 0,
      description: ''
    },
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'
    ],
    storageLocation: 'Grand Central Station - Lost and Found Office',
    createdAt: '2024-01-10T13:00:00Z',
    updatedAt: '2024-01-10T13:00:00Z',
    expiresAt: '2024-02-10T13:00:00Z',
    reportTypeDescription: 'Found Item',
    verificationStatus: 'verified',
    potentialMatches: 0,
    user: {
      id: 'user6',
      fullName: 'Amtrak Staff',
      username: 'amtrakstaff',
      profilePicture: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100',
      isVerified: true
    },
    timeAgo: '5d ago'
  },
  {
    id: '7',
    title: 'Lost Camera - Canon EOS R5',
    category: 'Electronics',
    location: 'High Line Park',
    currentLocation: '',
    date: '2024-01-09T16:30:00Z',
    time: '4:30 PM',
    status: 'lost',
    views: 423,
    type: 'lost',
    description: 'Lost my professional Canon EOS R5 camera with 24-70mm lens. Contains photos from important photoshoot.',
    circumstances: 'Set down the camera bag to tie my shoe, walked away without it',
    identifyingFeatures: 'Black Canon EOS R5 body, 24-70mm f/2.8 lens, black camera bag',
    condition: 'excellent',
    handoverPreference: 'meet',
    contactInfo: {
      name: 'Alex Rodriguez',
      phone: '+1-555-2222',
      email: 'alex.photo@email.com',
      preferredContact: 'phone'
    },
    reward: {
      amount: 300,
      description: 'Reward for professional camera equipment'
    },
    images: [
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400',
      'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400'
    ],
    storageLocation: '',
    createdAt: '2024-01-09T17:00:00Z',
    updatedAt: '2024-01-09T17:00:00Z',
    expiresAt: '2024-02-09T17:00:00Z',
    reportTypeDescription: 'Lost Electronics',
    verificationStatus: 'pending',
    potentialMatches: 1,
    user: {
      id: 'user7',
      fullName: 'Alex Rodriguez',
      username: 'alexphoto',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      isVerified: false
    },
    timeAgo: '6d ago'
  },
  {
    id: '8',
    title: 'Found Cat - Gray Tabby',
    category: 'Pets',
    location: 'Washington Square Park',
    currentLocation: 'ASPCA Adoption Center',
    date: '2024-01-08T09:15:00Z',
    time: '9:15 AM',
    status: 'found',
    views: 278,
    type: 'found',
    description: 'Found a friendly gray tabby cat wandering in the park. No collar, but very affectionate.',
    circumstances: 'Cat approached me while I was feeding pigeons',
    identifyingFeatures: 'Gray tabby with white paws, green eyes, no collar, very friendly',
    condition: 'good',
    handoverPreference: 'pickup',
    contactInfo: {
      name: 'ASPCA Center',
      phone: '+1-555-3333',
      email: 'adoption@aspca.org',
      preferredContact: 'phone'
    },
    reward: {
      amount: 0,
      description: ''
    },
    images: [
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400'
    ],
    storageLocation: 'ASPCA Adoption Center - 424 E 92nd St, NY',
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-08T10:00:00Z',
    expiresAt: '2024-02-08T10:00:00Z',
    reportTypeDescription: 'Found Pet',
    verificationStatus: 'verified',
    potentialMatches: 0,
    user: {
      id: 'user8',
      fullName: 'ASPCA Center',
      username: 'aspca',
      profilePicture: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=100',
      isVerified: true
    },
    timeAgo: '1w ago'
  }
];