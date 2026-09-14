import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token and mock latency header
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const mockLatency = localStorage.getItem('mock_latency');
  if (mockLatency && parseInt(mockLatency, 10) > 0) {
    config.headers['x-mock-delay'] = mockLatency;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg = error.response?.data?.error || error.message || 'An unexpected error occurred';
    return Promise.reject({
      status: error.response?.status,
      message: errorMsg,
      data: error.response?.data,
    });
  }
);
