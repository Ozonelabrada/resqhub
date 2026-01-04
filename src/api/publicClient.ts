import axios from 'axios';

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:7003' || 'https://resqhub-be.onrender.com',
  timeout: Number(import.meta.env.VITE_APP_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// No auth interceptor for public requests
// No redirect on 401/403 for public data

export default publicApi;