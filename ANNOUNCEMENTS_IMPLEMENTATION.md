# Announcements Feature Implementation Guide

## Overview
This guide explains how to integrate the announcements feature into your ReSQHub application. The feature allows admins and community managers to create and manage announcements for different user roles and communities, with real-time delivery via WebSocket and offline support.

## ✅ What's Implemented

### Services & APIs
- ✅ `AnnouncementsService` - API calls for CRUD operations
- ✅ Endpoints: 
  - POST `/announcements` - Create announcement
  - GET `/announcements/active` - Get active announcements
  - PUT `/announcements/{id}` - Update announcement
  - DELETE `/announcements/{id}` - Delete announcement

### Hooks
- ✅ `useAnnouncements()` - For admins to manage announcements
- ✅ `useUserAnnouncements()` - For regular users to view announcements

### Components
- ✅ `CreateAnnouncementModal` - Form to create new announcements
- ✅ `AnnouncementsManagement` - Admin dashboard for managing all announcements
- ✅ `AnnouncementBanner` - Display urgent announcements at the top of pages
- ✅ `AnnouncementList` - Full list view of announcements for users

### WebSocket Integration
- ✅ Real-time event handlers for:
  - `AnnouncementCreated` - Admin creates announcement
  - `AnnouncementUpdated` - Admin updates announcement
  - `AnnouncementReceived` - User receives announcement

### Types & Endpoints
- ✅ Admin types: `Announcement`, `CreateAnnouncementRequest`, `AnnouncementAudience`
- ✅ API endpoints configured in `endpoint.ts`
- ✅ Full TypeScript support

## 📌 How to Integrate

### 1. Add to Admin Dashboard
Import and use in your admin panel:

```tsx
import { AnnouncementsManagement } from '@/components/admin/AnnouncementsManagement';

// In your admin page/layout
<AnnouncementsManagement />
```

### 2. Display Announcements to Users
Add to your main layout or dashboard:

```tsx
import { AnnouncementBanner } from '@/components/shared/AnnouncementBanner';
import { AnnouncementList } from '@/components/shared/AnnouncementList';

// At the top of your page layout
<AnnouncementBanner />

// Or in a dedicated announcements page
<AnnouncementList />
```

### 3. WebSocket Real-time Updates
Already integrated! The service automatically:
- Listens for `AnnouncementCreated` events from admins
- Listens for `AnnouncementReceived` events for user-specific announcements
- Updates the UI in real-time for connected users

## 🎯 User Flows

### For Admins - Creating Global Announcements

```
1. Go to Admin Dashboard → Announcements Management
2. Click "Create Announcement" button
3. Fill in form:
   - Title (required)
   - Message (required)
   - Target Audience: all | admins | moderators | riders | sellers
   - Priority: low | medium | high
   - Icon: info | warning | success | error | bell | star
   - Optional: Expiration Date
4. Click "Create Announcement"
5. WebSocket sends real-time notification to all online users in that audience
```

### For Community Admins - Community-Specific Announcements

```
1. Same as above, but:
   - Select: "Community Admins" or "Community Moderators"
   - Enter Community ID
3. Announcement only goes to admins/moderators of that community
```

### For Users - Receiving Announcements

**Online Users:**
- Receive announcement immediately via WebSocket
- See notification banner with urgent announcements
- Can view all announcements in dedicated list

**Offline Users:**
- Launch app or navigate to announcements page
- App calls `/announcements/active` endpoint
- Displays all active announcements

## 🔧 Configuration

### Target Audiences
The feature supports these audience types:

```typescript
'all'                    // All users globally
'admins'                 // All global admins
'moderators'             // All global moderators
'riders'                 // All riders
'sellers'                // All sellers
'community_admins'       // Admins of specific community (requires communityId)
'community_moderators'   // Moderators of specific community (requires communityId)
```

### Priority Levels
```typescript
'low'     // Blue/info badge
'medium'  // Yellow/warning badge
'high'    // Red/danger badge
```

### Icon Types
```typescript
'info'       // ℹ️ Information icon
'warning'    // ⚠️ Warning icon
'success'    // ✅ Success icon
'error'      // ❌ Error icon
'bell'       // 🔔 Bell icon
'star'       // ⭐ Star icon
```

## 📊 Data Types

### Announcement
```typescript
interface Announcement {
  id: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'admins' | 'moderators' | 'riders' | 'sellers' 
                | 'community_admins' | 'community_moderators';
  priority: 'low' | 'medium' | 'high';
  iconType: 'info' | 'warning' | 'success' | 'error' | 'bell' | 'star';
  communityId?: number;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
  viewCount?: number;
}
```

## 🔌 API Endpoints

### Global Announcements
```bash
POST /announcements
{
  "title": "System Maintenance",
  "message": "Platform will be down for 2 hours tonight",
  "targetAudience": "all",
  "priority": "high",
  "iconType": "warning",
  "expiresAt": "2025-03-08T02:00:00Z"
}
```

### Community-Specific Announcements
```bash
POST /announcements
{
  "title": "Community Event Alert",
  "message": "50 new members joined",
  "communityId": 5,
  "targetAudience": "community_admins",
  "priority": "medium",
  "iconType": "info"
}
```

### Get Active Announcements
```bash
# Get all active announcements for user
GET /announcements/active

# Get active announcements for specific audience
GET /announcements/active?targetAudience=riders

# Update/Delete
PUT /announcements/{id}
DELETE /announcements/{id}
```

## 🚀 Usage Examples

### Admin Creating Announcement
```tsx
import { useAnnouncements } from '@/hooks/useAnnouncements';

function MyComponent() {
  const { createAnnouncement } = useAnnouncements();

  const handleCreate = async () => {
    await createAnnouncement({
      title: 'System Maintenance',
      message: 'We\'ll be performing system maintenance tonight...',
      targetAudience: 'all',
      priority: 'high',
      iconType: 'warning'
    });
  };

  return <button onClick={handleCreate}>Create</button>;
}
```

### User Viewing Announcements
```tsx
import { useUserAnnouncements } from '@/hooks/useAnnouncements';

function UserAnnouncements() {
  const { announcements, loading } = useUserAnnouncements();

  return (
    <div>
      {announcements.map(announcement => (
        <div key={announcement.id}>
          <h3>{announcement.title}</h3>
          <p>{announcement.message}</p>
        </div>
      ))}
    </div>
  );
}
```

### Listen for Real-time Events
```tsx
import websocketService from '@/services/websocketService';
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    // Listen for new announcements
    websocketService.on('announcement_received', (announcement) => {
      console.log('New announcement:', announcement);
      // Update UI
    });

    return () => {
      websocketService.off('announcement_received');
    };
  }, []);
}
```

## 🎨 UI Integration Points

### Message App (React Prime)
- `Message` component for displaying announcement banners
- `DataTable` for listing announcements
- `Dialog` for create/edit modals
- `Button`, `Badge` for actions and status

### CSS Classes
All components use PrimeReact themes. Customize via:
- Component CSS files (separate `.css` for each)
- PrimeReact theme variables
- Tailwind classes (if configured)

## 📱 Responsive Design
All components are fully responsive with breakpoints:
- Desktop: Full functionality
- Tablet: Optimized layout
- Mobile: Touch-friendly, stacked layout

## 🔐 Authorization
Backend should implement:
- Only admins and community admins can create announcements
- Only admins can see all announcements
- Users only see announcements for their role(s)
- WebSocket only sends to authorized users

## 🐛 Troubleshooting

### Announcements not showing in real-time?
- Verify WebSocket is connected: Check `isConnected` status
- Verify backend is sending `AnnouncementCreated` events
- Check user's role matches `targetAudience`

### Offline users not seeing announcements?
- Verify `/announcements/active` endpoint returns data
- Check network request in DevTools
- Ensure app calls endpoint on init/refresh

### Create announcement modal not showing?
- Import the component correctly
- Ensure `visible` prop is true
- Check for CSS import errors

## 📈 Future Enhancements
- [ ] Announcement templates
- [ ] Scheduled announcements (publish at specific time)
- [ ] Read receipts/analytics
- [ ] Translation/localization
- [ ] Announcement categories
- [ ] Pin announcements

## 📚 Related Files

- Service: `src/services/announcementsService.ts`
- Hook: `src/hooks/useAnnouncements.ts`
- Admin Component: `src/components/admin/AnnouncementsManagement.tsx`
- Admin Modal: `src/components/admin/CreateAnnouncementModal.tsx`
- User Banner: `src/components/shared/AnnouncementBanner.tsx`
- User List: `src/components/shared/AnnouncementList.tsx`
- Types: `src/types/admin.ts` (Announcement types)
- Endpoints: `src/api/endpoint.ts` (API routes)
