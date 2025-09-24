// Environment Configuration
// Centralizes all backend API configuration

// Backend API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.com/api'  // Replace with your production backend URL
    : 'http://localhost:4000/api',
  
  HEALTH_CHECK_URL: process.env.NODE_ENV === 'production'
    ? 'https://your-backend-domain.com/health'
    : 'http://localhost:4000/health',
    
  TIMEOUT: 10000, // 10 seconds
};

// Feature Flags
export const FEATURES = {
  USE_SPRING_BOOT_BACKEND: true,
  ENABLE_DEMO_MODE: true,
  ENABLE_OFFLINE_MODE: false,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  TEST_PROGRESS: 'test_progress',
};

export default {
  API_CONFIG,
  FEATURES,
  STORAGE_KEYS,
};