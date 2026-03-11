// API endpoints
export const API_URL = 'http://localhost:8080/api';

// App constants
export const APP_NAME = 'GramVikash';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  LANGUAGE: '@language',
  THEME: '@theme',
};

// Screen names
export const SCREENS = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',

  // Main tabs
  HOME: 'Home',
  SCHEMES: 'Schemes',
  DIAGNOSTICS: 'Diagnostics',
  EMERGENCY: 'Emergency',
  PROFILE: 'Profile',

  // Stack screens
  SCHEME_DETAIL: 'SchemeDetail',
  NOTIFICATION: 'Notification',
  SETTINGS: 'Settings',
};

// Colors (matching tailwind config — myScheme palette)
export const COLORS = {
  // Primary
  primary: '#2D6A4F',
  primaryLight: '#52B788',
  primaryLighter: '#B7E4C7',
  primaryDark: '#1B4332',

  // Accent
  accentGreen: '#4CAF50',
  accentTeal: '#3D8B5E',

  // Background
  background: '#F4FAF6',
  card: '#FFFFFF',
  section: '#EAF5EE',
  overlay: '#D8EFE2',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  textOnPrimary: '#FFFFFF',

  // UI
  border: '#C8E6C9',
  borderActive: '#2D6A4F',
  inputBg: '#FFFFFF',
  shadow: '#A8D5B5',

  // State
  selected: '#2D6A4F',
  selectedBg: '#EAF5EE',
  unselected: '#F9F9F9',
  disabled: '#D1D5DB',

  // Brand
  brandOrange: '#FF6B00',
  brandNavy: '#1A237E',

  // Utility
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  white: '#FFFFFF',
  black: '#000000',
};
