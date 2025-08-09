export class ApiClient {
  public baseURL: string;
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
    
    const token = localStorage.getItem('publicUserToken');
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...(token && !this.isAuthEndpoint(endpoint) && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);
      
      // Always try to parse the response as JSON first
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, create a basic error response
        responseData = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          succeeded: false,
          statusCode: response.status,
          data: null,
          errors: null
        };
      }

      // For authentication endpoints, return the full response (success or failure)
      if (this.isAuthEndpoint(endpoint)) {
        return responseData;
      }

      // For non-auth endpoints, handle errors as before
      if (!response.ok) {
        if (response.status === 401 && !this.isAuthEndpoint(endpoint)) {
          localStorage.removeItem('publicUserToken');
          localStorage.removeItem('publicUserData');
          throw new Error('Authentication failed. Please sign in again.');
        }
        
        // Throw the parsed response data so the calling code can handle it
        throw responseData;
      }
      
      return responseData;
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  private isAuthEndpoint(endpoint: string): boolean {
    const authEndpoints = ['/login', '/register', '/signup', '/signin', '/auth', '/callback'];
    return authEndpoints.some(authEndpoint => endpoint.includes(authEndpoint));
  }
}

// Multiple API clients for different services
export const mainApiClient = new ApiClient(import.meta.env.REACT_APP_API_BASE_URL);
export const authApiClient = new ApiClient(`${import.meta.env.REACT_APP_API_BASE_URL}/auth`);
export const reportsApiClient = new ApiClient(`${import.meta.env.REACT_APP_API_BASE_URL}/reports`);