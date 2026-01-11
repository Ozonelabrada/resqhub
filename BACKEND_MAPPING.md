# Backend API Mapping - FindrHub Frontend

This document maps the Frontend features to the Backend endpoints as defined in the Postman Collection.

## Base URL

- Dev: `http://localhost:7003` (or configured via `VITE_APP_API_BASE_URL`)
- Prod: `https://resqhub-be.onrender.com`

---

## 1. Reports & Posts

Used in: `CreateReportModal`, `NewsFeedPage`, `CommunityPage`, `useNewsFeed`, `useCreateReport`

| Feature            | Method | Endpoint        | Payload Type          | Description                                  |
| :----------------- | :----- | :-------------- | :-------------------- | :------------------------------------------- |
| Create Report/Post | `POST` | `/reports`      | `multipart/form-data` | Creates a new report with up to 5 images.    |
| Get All Reports    | `GET`  | `/reports/all`  | Query Params          | Fetches feed with filtering for type/search. |
| Get Report Detail  | `GET`  | `/reports/{id}` | N/A                   | Fetches detailed info for a specific item.   |
| Upload Images      | `POST` | `/reports`      | `ImageFiles[]`        | Handled via the main multipart payload.      |

---

## 2. Comments

Used in: `NewsFeedCard`, `CommentSection`, `CommentsService`

| Feature             | Method | Endpoint                       | Payload Type | Description                                    |
| :------------------ | :----- | :----------------------------- | :----------- | :--------------------------------------------- |
| Get Report Comments | `GET`  | `/report-comments/report/{id}` | N/A          | Fetches all comments for a specific report.    |
| Add Report Comment  | `POST` | `/report-comments`             | `JSON`       | (Planned) Aligned with new comment controller. |

---

## 3. Messaging (Direct & Group)

Used in: `MessagesContainer`, `ChatBox`, `useMessages`

| Feature                | Method | Endpoint                   | Payload Type | Description                                   |
| :--------------------- | :----- | :------------------------- | :----------- | :-------------------------------------------- |
| Send Message           | `POST` | `/message`                 | `JSON`       | Encapsulates both direct and group messages.  |
| Get Direct Mesages     | `GET`  | `/messages/direct`         | Query Params | Fetches conversation with a specific partner. |
| Get Community Messages | `GET`  | `/messages/community/{id}` | Path + Query | Fetches group chat history for a community.   |
| Get Unread Count       | `GET`  | `/messages/unread-count`   | N/A          | Global badges for messages.                   |

---

## 3. Communities

Used in: `CommunitySidebar`, `CreateCommunityModal`, `CommunityPage`

| Feature                 | Method | Endpoint                  | Payload Type | Description                            |
| :---------------------- | :----- | :------------------------ | :----------- | :------------------------------------- |
| List Communities        | `GET`  | `/communities`            | N/A          | Fetches public communities.            |
| Join Community          | `POST` | `/communities/{id}/join`  | N/A          | Adds user to community membership.     |
| Create/Submit Community | `POST` | `/communities`            | `JSON`       | Submits a community for admin review.  |
| Get Community Profile   | `GET`  | `/communities/{id}`       | N/A          | Fetches community metadata.            |
| Get Community Posts     | `GET`  | `/communities/{id}/posts` | Query Params | Fetches posts specific to a community. |

---

## 4. Admin Flows

Used in: `AdminCommunityDashboard` (To be implemented)

| Feature                  | Method | Endpoint                          | Payload Type | Description                       |
| :----------------------- | :----- | :-------------------------------- | :----------- | :-------------------------------- |
| List Pending Communities | `GET`  | `/admin/communities/pending`      | N/A          | Review queue for new communities. |
| Approve Community        | `POST` | `/admin/communities/{id}/approve` | `JSON`       | Sets community to active status.  |
| Reject Community         | `POST` | `/admin/communities/{id}/reject`  | `JSON`       | Rejects with feedback.            |

---

## 5. Authentication

Used in: `AuthContext`, `LoginModal`, `SignUpModal`

| Feature      | Method | Endpoint         | Payload Type | Description                |
| :----------- | :----- | :--------------- | :----------- | :------------------------- |
| Login        | `POST` | `/auth/login`    | `JSON`       | Returns JWT and user info. |
| Google Login | `GET`  | `/auth/google`   | N/A          | Redirects to Google OAuth. |
| Callback     | `GET`  | `/auth/callback` | N/A          | Handles OAuth return.      |
