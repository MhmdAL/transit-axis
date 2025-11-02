// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api',
  USE_MOCK_DATA: false, // Default to mock for development
  TIMEOUT: 10000, // 10 seconds
};

// API Endpoints
export const API_ENDPOINTS = {
  VEHICLES: '/vehicles',
  DRIVERS: '/drivers',
  ROUTES: '/routes',
  STOPS: '/stops',
  TRIPS: '/trips',
  TRACKING: '/tracking',
  DASHBOARD: '/dashboard/stats',
  VEHICLE_MODELS: '/vehicle-models',
  AUTH: '/auth',
  SERVICE_SCHEDULES: '/service-schedules',
  DUTIES: '/duties',
} as const;

// Helper to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};


