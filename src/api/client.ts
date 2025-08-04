export class ApiClient {
  public baseURL: string; // Make this public so AuthService can access it
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string, headers: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'accept': '*/*',
      ...headers
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage if available
    const token = localStorage.getItem('publicUserToken');
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        // Add Authorization header if token exists (but not for login/register endpoints)
        ...(token && !this.isAuthEndpoint(endpoint) && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      // Include credentials for all requests
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 401) {
          // Only clear tokens if this is NOT a login/register endpoint
          if (!this.isAuthEndpoint(endpoint)) {
            localStorage.removeItem('publicUserToken');
            localStorage.removeItem('publicUserData');
            throw new Error('Authentication failed. Please sign in again.');
          } else {
            // For auth endpoints, get the actual error message
            try {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Invalid credentials. Please check your email and password.');
            } catch (parseError) {
              throw new Error('Invalid credentials. Please check your email and password.');
            }
          }
        }
        
        // Try to get error message from response for other status codes
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      return response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Helper method to check if endpoint is an authentication endpoint
  private isAuthEndpoint(endpoint: string): boolean {
    const authEndpoints = ['/login', '/register', '/signup', '/signin', '/auth', '/callback'];
    return authEndpoints.some(authEndpoint => endpoint.includes(authEndpoint));
  }
}

// Multiple API clients for different services
export const mainApiClient = new ApiClient('http://localhost:7333');
export const authApiClient = new ApiClient('http://localhost:7333/auth');
export const reportsApiClient = new ApiClient('http://localhost:7333/reports');