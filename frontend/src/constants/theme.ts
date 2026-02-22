export const COLORS = {
  primary: '#1a365d',
  accent: '#E53E3E',
  secondary: '#38A169',
  background: '#F7FAFC',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F7FAFC',
    100: '#EDF2F7',
    200: '#E2E8F0',
    300: '#CBD5E0',
    400: '#A0AEC0',
    500: '#718096',
    600: '#4A5568',
    700: '#2D3748',
    800: '#1A202C',
    900: '#171923',
  },
  danger: '#E53E3E',
  success: '#38A169',
  warning: '#D69E2E',
  info: '#3182CE',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const CAMPUS_LOCATIONS = {
  center: { latitude: 45.0875, longitude: -64.3665 },
  bounds: {
    north: 45.0920,
    south: 45.0830,
    east: -64.3600,
    west: -64.3730,
  },
};

export const EMERGENCY_CONTACTS = [
  { id: '1', name: 'Acadia Security', phone: '902-585-1103', icon: 'shield' },
  { id: '2', name: 'Emergency (911)', phone: '911', icon: 'alert-circle' },
  { id: '3', name: 'Campus Health', phone: '902-585-1234', icon: 'medkit' },
  { id: '4', name: 'Crisis Helpline', phone: '1-833-456-4566', icon: 'heart' },
  { id: '5', name: 'Wolfville Police', phone: '902-542-3817', icon: 'shield-checkmark' },
];

export const INCIDENT_TYPES = [
  'Suspicious Activity',
  'Theft',
  'Harassment',
  'Property Damage',
  'Safety Hazard',
  'Other',
];

export const ALERT_TYPES = {
  emergency: { color: COLORS.accent, icon: 'alert-circle' },
  advisory: { color: COLORS.warning, icon: 'warning' },
  info: { color: COLORS.info, icon: 'information-circle' },
};
