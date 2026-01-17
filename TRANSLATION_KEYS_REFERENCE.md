# Translation Keys Reference

## Overview

This document outlines the translation key structure to avoid conflicts and duplication in the application.

## Key Organization

### Top-Level Sections

- **`common`** - General UI terms (Create, Cancel, Loading, etc.)
- **`form`** - Generic form field labels (Title, Description, Start Date, etc.)
- **`categories`** - Category options (General, Urgent, Community, Educational, Entertainment)
- **`hub`** - Hub/Feed related terms (News, Announcements, Discussions, etc.)
- **`report`** - Report creation form specific keys (Images, Upload, Error messages)
- **`auth`** - Authentication related terms (Login, Sign up, etc.)
- **`community`** - Community specific content with nested subsections

### Community Subsections

```
community:
  ├── eventAnnouncement
  │   └── validation
  │       ├── titleRequired
  │       ├── descriptionRequired
  │       ├── startDateRequired
  │       ├── endDateRequired
  │       ├── endDateAfterStart
  │       └── categoryRequired
  ├── announcement
  ├── announcements
  │   └── create
  │       └── description
  ├── news
  │   └── create
  │       └── description
  ├── events
  │   └── create
  │       └── description
  ├── create (nested object for community creation flow)
  ├── create_content
  ├── profile
  └── ... other community-related keys
```

## Component Translation Usage

### CreateEventAnnouncementModal

- **Form Fields**: Uses `form.*` keys
  - `form.title`, `form.titlePlaceholder`
  - `form.description`, `form.descriptionPlaceholder`
  - `form.startDate`, `form.endDate`, `form.time`, `form.optional`
  - `form.type`, `form.category`, `form.selectCategory`
  - `form.isActive`

- **Validation Messages**: Uses `community.eventAnnouncement.validation.*` keys
  - `community.eventAnnouncement.validation.titleRequired`
  - `community.eventAnnouncement.validation.descriptionRequired`
  - `community.eventAnnouncement.validation.startDateRequired`
  - `community.eventAnnouncement.validation.endDateRequired`
  - `community.eventAnnouncement.validation.endDateAfterStart`
  - `community.eventAnnouncement.validation.categoryRequired`

- **Type Labels**: Uses `common.*` keys
  - `common.announcement`, `common.news`, `common.events`

- **Categories**: Uses `categories.*` keys
  - `categories.general`, `categories.urgent`, `categories.community`, etc.

- **General UI**: Uses `common.*` and `report.*` keys
  - `common.create`, `common.creating`, `common.cancel`, `common.error`
  - `report.images`, `report.upload`, `report.error_max_images`

## Naming Conventions

### Avoid Duplicates

- Don't use the same key name at different hierarchy levels
- Example: ❌ `create` (string) vs ✅ `createCommunity` (for community creation link)
- Example: ✅ `community.create` (object for creation flow) is OK because it's nested

### Key Naming

- Use camelCase for key names
- Use dot notation for nested access in code
- Validation messages should be under `[feature].validation`
- Descriptions should be under `[feature].create.description`

## Related Files

- **Translation File**: `src/locales/en.json`
- **Component**: `src/components/modals/EventAnnouncement/CreateEventAnnouncementModal.tsx`
- **Integration**: `src/components/pages/public/CommunityPage/CommunityPage.tsx`

## Future Additions

When adding new translations:

1. Check for existing similar keys to reuse
2. Organize under appropriate top-level section
3. Use nested structure for feature-specific content
4. Avoid top-level validation sections - nest under feature
5. Update this reference document
