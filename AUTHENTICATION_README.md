# FindrHub Authentication System

A comprehensive, secure, and user-friendly authentication system for FindrHub built with React, TypeScript, and modern security practices.

## Features

### 🔐 Core Authentication

- **Email/Phone + Password Login**: Secure credential-based authentication
- **JWT Token Management**: Automatic token generation, storage, and refresh
- **Session Management**: Intelligent session handling with activity tracking
- **Multi-tab Synchronization**: Logout in one tab affects all tabs instantly

### 🛡️ Security Features

- **Secure Token Storage**: Encrypted token storage with sessionStorage/localStorage fallback
- **Rate Limiting**: Protection against brute force attacks (5 attempts per 15 minutes)
- **Token Validation**: Automatic JWT format validation and server-side verification
- **Activity Monitoring**: Real-time user activity tracking for session management

### ⏰ Session Management

- **Auto-Login**: Seamless login if valid token exists
- **Token Refresh**: Background token refresh before expiration
- **Session Timeout**: Configurable inactivity timeout with user warnings
- **Session Extension**: Users can extend sessions when warned

### 🎨 User Experience

- **Beautiful UI**: Modern, responsive design with glassmorphism effects
- **Loading States**: Smooth loading indicators and transitions
- **Error Handling**: Comprehensive error messages and recovery options
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

## Architecture

### Components

#### `SessionManager`

Central session management singleton that handles:

- Token storage and retrieval
- Session state management
- Activity tracking
- Multi-tab synchronization via BroadcastChannel
- Automatic token refresh
- Session timeout handling

#### `AuthContext`

React context providing authentication state and methods:

- Authentication status
- User data and token access
- Login/logout functionality
- Session timeout warnings

#### `AuthGuard`

Route protection component that:

- Checks authentication requirements
- Handles redirects for unauthorized access
- Shows session timeout warnings
- Manages force logout notifications

#### `AuthService`

API service layer handling:

- Authentication API calls
- Token validation
- Rate limiting
- Security event logging

### Security Components

#### `SecureTokenStorage`

Enhanced token storage with:

- Encryption for sensitive data
- Session and local storage support
- Automatic fallback handling

#### `SessionTimeoutWarning`

User-friendly timeout warning with:

- Countdown timer
- Session extension option
- Automatic logout on timeout

## Usage

### Basic Setup

```tsx
import { AuthProvider } from "./context/AuthContext";
import AuthGuard from "./components/common/AuthGuard";

function App() {
  return (
    <AuthProvider>
      <AuthGuard requireAuth={false}>{/* Public routes */}</AuthGuard>

      <AuthGuard requireAuth={true}>{/* Protected routes */}</AuthGuard>
    </AuthProvider>
  );
}
```

### Using Authentication Hooks

```tsx
import { useAuth } from "./context/AuthContext";

function LoginComponent() {
  const { login, isAuthenticated, userData, sessionTimeoutWarning } = useAuth();

  const handleLogin = async () => {
    try {
      await login("user@example.com", "password");
      // Login successful - user will be redirected
    } catch (error) {
      // Handle login error
    }
  };

  return (
    <div>
      {sessionTimeoutWarning && <SessionTimeoutWarning />}
      {/* Login form */}
    </div>
  );
}
```

### Route Protection

```tsx
import { Routes, Route } from "react-router-dom";
import AuthGuard from "./components/common/AuthGuard";
import LoginPage from "./components/shared/LoginPage";
import Dashboard from "./pages/Dashboard";

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthGuard requireAuth={false}>
            <LoginPage />
          </AuthGuard>
        }
      />

      <Route
        path="/dashboard"
        element={
          <AuthGuard requireAuth={true}>
            <Dashboard />
          </AuthGuard>
        }
      />
    </Routes>
  );
}
```

### Session Management

```tsx
import { sessionManager } from "./utils/sessionManager";

// Check authentication status
const isLoggedIn = sessionManager.isAuthenticated();

// Get current user data
const user = sessionManager.getUserData();

// Get current token
const token = sessionManager.getToken();

// Extend session manually
sessionManager.extendSession();

// Listen for session changes
sessionManager.addSessionListener((state) => {
  console.log("Session updated:", state);
});
```

## Configuration

### Session Configuration

```typescript
import { SessionManager } from "./utils/sessionManager";

// Configure session manager (optional)
const sessionManager = SessionManager.getInstance({
  tokenRefreshThreshold: 5, // Refresh 5 minutes before expiry
  sessionTimeout: 30, // 30 minutes inactivity timeout
  warningTime: 5, // Warn 5 minutes before timeout
  maxConcurrentSessions: 3, // Maximum concurrent sessions
});
```

### API Integration

The authentication system expects the following API endpoints:

```typescript
// Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Token refresh
POST /auth/refresh
// Uses refresh token from Authorization header

// Logout
POST /auth/logout

// User validation
GET /me
// Returns current user data if token is valid
```

### Token Response Format

```typescript
interface AuthResponse {
  succeeded: boolean;
  token: string;
  refreshToken?: string;
  expiresAt?: number; // Timestamp in milliseconds
  user: {
    id: number;
    name: string;
    email: string;
    role: "user" | "admin";
    // ... other user fields
  };
}
```

## Security Best Practices

### Token Security

- Tokens are encrypted in storage using Web Crypto API
- Automatic cleanup on logout or session expiry
- Server-side token validation on every request

### Session Security

- Activity-based session timeout
- Multi-tab logout synchronization
- Secure random session IDs
- Rate limiting on login attempts

### Network Security

- HTTPS-only token transmission
- Automatic token refresh before expiry
- Secure headers on all API requests

## Error Handling

### Login Errors

- Invalid credentials
- Rate limiting
- Network errors
- Account locked/disabled

### Session Errors

- Token expiry
- Invalid tokens
- Network connectivity issues
- Concurrent session limits

### Recovery Options

- Clear error messages
- Retry mechanisms
- Password reset flows
- Support contact information

## Testing

### Unit Tests

```typescript
import { sessionManager } from "./utils/sessionManager";
import { AuthService } from "./services/authService";

// Test authentication flow
describe("Authentication", () => {
  it("should login successfully", async () => {
    const mockResponse = {
      succeeded: true,
      token: "jwt-token",
      user: { id: 1, name: "Test User" },
    };

    // Mock API response
    jest.spyOn(AuthService, "signIn").mockResolvedValue(mockResponse);

    await sessionManager.login({
      email: "test@example.com",
      password: "password",
    });

    expect(sessionManager.isAuthenticated()).toBe(true);
  });
});
```

### Integration Tests

- End-to-end login flows
- Session timeout scenarios
- Multi-tab synchronization
- Token refresh functionality

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Migration Guide

### From Legacy Authentication

1. **Update AuthContext usage**:

   ```tsx
   // Old
   const { login: oldLogin } = useAuth();
   await oldLogin(token, user);

   // New
   const { login } = useAuth();
   await login(email, password);
   ```

2. **Replace route guards**:

   ```tsx
   // Old - manual checks
   {
     isAuthenticated ? <Dashboard /> : <Login />;
   }

   // New - AuthGuard component
   <AuthGuard requireAuth={true}>
     <Dashboard />
   </AuthGuard>;
   ```

3. **Update API calls**:
   - The API client automatically includes tokens
   - No manual token management needed

## Troubleshooting

### Common Issues

1. **Login not persisting**

   - Check if secure storage is available
   - Verify token format and expiry

2. **Session timeout not working**

   - Check activity event listeners
   - Verify session configuration

3. **Multi-tab sync not working**
   - Ensure BroadcastChannel is supported
   - Check for browser compatibility

### Debug Mode

Enable debug logging:

```typescript
localStorage.setItem("findrhub_debug", "true");
```

This enables detailed logging for:

- Authentication events
- Session state changes
- Token operations
- Security events

## Contributing

When contributing to the authentication system:

1. Maintain backward compatibility
2. Add comprehensive tests
3. Update documentation
4. Follow security best practices
5. Test across supported browsers

## License

This authentication system is part of the FindrHub project.
