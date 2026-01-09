# QA Checklist & Acceptance Criteria - SHERRA Frontend

Use this checklist to verify that the frontend integration with the backend is successful.

## 1. Homepage & Navigation

- [ ] **Get Started Button**: Confirm "Get Started" appears beside "Lost" and "Found".
- [ ] **Routing**: Clicking "Get Started" navigates to `/hub`. If not logged in, it prompts for login.
- [ ] **Aria labels**: Button has proper `aria-label` for screen readers.

## 2. NewsFeed Layout & Scrolling

- [ ] **Standard Scrolling**: Verify the entire page scrolls vertically (no independent inner-column scrolling).
- [ ] **Sticky Sidebars**: Sidebars on desktop (`NewsFeedSidebar` and `CommunitySidebar`) use `sticky` positioning to stay visible during scroll.
- [ ] **Responsive Design**: On mobile, columns stack vertically with correct order (Center Feed first, followed by sidebars).
- [ ] **Footer Visibility**: Global footer is visible at the bottom of the page in all views.

## 3. Comments Integration

- [ ] **Comments Fetching**: Verify clicking the comment button calls `GET /report-comments/report/:reportId`.
- [ ] **Comments Display**: Ensure comments are rendered correctly in the expanded card view.

## 4. Create Post (Reports)

- [ ] **Multipart Payload**: Capture network request for `POST /reports` and verify it's `multipart/form-data`.
- [ ] **Fields**: Verify `UserId`, `CategoryId`, `Title`, `Description`, `Location`, `ContactInfo`, `RewardDetails`, and `ReportType` are present.
- [ ] **Image Upload**: Upload 1-5 images. Verify they are appended as `ImageFiles` in the payload.
- [ ] **Validation**: Verify the UI prevents more than 5 images.
- [ ] **Feedback**: Success/Error toasts appear after submission.

## 4. Messages

- [ ] **Search**: Type in message list search. Confirm `GET /users/search?q=...` (mapped from `UserService`) is called.
- [ ] **Chat Logic**: Clicking a user opens the chat box.
- [ ] **History**: Verify `GET /messages/direct?conversationPartnerId={id}` loads existing messages.
- [ ] **Send**: Verify `POST /message` sends the correct JSON payload.
- [ ] **Community Chat**: Verify `GET /messages/community/{id}` loads group messages.

## 5. UI/UX Polishing

- [ ] **Profile Dropdown**: Open profile menu. Ensure it is fully visible and not clipped by the viewport edge (Portaled).
- [ ] **Loading States**: Skeletons appear while feed is loading.
- [ ] **Feature Flags**: Toggle `messages` or `community_hub` in `FeatureFlagContext.tsx` (Default flags). Verify UI elements hide/show accordingly.

## 6. Admin Flows

- [ ] **Pending Communities**: Access `/admin/communities`. Verify `GET /admin/communities/pending` is called.
- [ ] **Decision**: Clicking "Approve" calls the status update endpoint.

---

### Backend Endpoint Verification (Postman Reference)

- Reports creation: `POST /reports` (Multipart)
- Direct Messages: `GET /messages/direct`
- Send Message: `POST /message`
- Communities: `GET /communities`
- Admin Review: `GET /admin/communities/pending`
