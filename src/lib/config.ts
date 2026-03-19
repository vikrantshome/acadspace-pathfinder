// Environment Configuration
// Centralizes all backend API configuration

const normalizePartner = (rawPartner: string | undefined): "naviksha" | "allen" => {
  const partner = rawPartner?.trim().toLowerCase();
  return partner === "allen" ? "allen" : "naviksha";
};

// Backend API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BACKEND_URL 
    ? `${import.meta.env.VITE_BACKEND_URL}/api`
    : 'http://localhost:4000/api',
  
  HEALTH_CHECK_URL: import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/health`
    : 'http://localhost:4000/health',
    
  TIMEOUT: 10000, // 10 seconds
};

// Feature Flags
export const FEATURES = {
  USE_SPRING_BOOT_BACKEND: true,
  ENABLE_DEMO_MODE: true,
  ENABLE_OFFLINE_MODE: false,
};

// Deployment Branding
export const PARTNER_CONFIG = {
  DEFAULT_PARTNER: normalizePartner(import.meta.env.VITE_PARTNER),
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
  PARTNER_CONFIG,
  STORAGE_KEYS,
};
