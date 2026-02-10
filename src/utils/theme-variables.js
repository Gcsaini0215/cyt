/**
 * Histudy Theme Variables
 * Choose Your Therapist - Design System
 * Based on Rainbow Themes Histudy Template
 */

export const THEME_COLORS = {
  // Primary Colors
  primary: '#59c82f',      // Main green
  primaryAlt: '#d1ebe6',   // Light green
  secondary: '#2ecc71',    // Accent green
  
  // Brand Colors  
  therapistGreen: '#228756',  // Custom therapist green
  therapistGreenLight: '#e8f5e8',
  therapistGreenDark: '#1b6843',
  
  // Semantic Colors
  success: '#198754',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#0dcaf0',
  
  // Neutral Colors
  heading: '#1a1a1a',
  body: '#6c757d',
  bodyLight: '#525f7f',
  white: '#ffffff',
  whiteOff: '#f8f9fa',
  dark: '#212529',
  darker: '#000000',
  
  // Gray Scale
  gray100: '#f8f9fa',
  gray200: '#e9ecef',
  gray300: '#dee2e6',
  gray400: '#ced4da',
  gray500: '#adb5bd',
  gray600: '#6c757d',
  gray700: '#495057',
  gray800: '#343a40',
  gray900: '#212529',
  
  // Border Colors
  border: '#e3e3e3',
  borderLight: '#f0f0f0',
};

export const GRADIENTS = {
  primary: 'linear-gradient(90deg, #228756, #56ab2f)',
  secondary: 'linear-gradient(90deg, #004e92, #005bea)',
  therapist: 'linear-gradient(135deg, #36b477ff 0%, #35c06fff 50%, #2c7754ff 100%)',
  green: 'linear-gradient(270deg, #59c82f 0%, #228756 100%)',
};

export const SHADOWS = {
  sm: '0 2px 8px rgba(0,0,0,0.08)',
  md: '0 4px 12px rgba(0,0,0,0.1)',
  lg: '0 8px 32px rgba(34, 135, 86, 0.15)',
  xl: '0 10px 40px rgba(0,0,0,0.2)',
  card: '0 10px 25px rgba(0,0,0,0.08)',
  hover: '0 15px 35px rgba(34, 135, 86, 0.15)',
  therapist: '0 4px 12px rgba(34, 135, 86, 0.2)',
};

export const BORDER_RADIUS = {
  xs: '4px',
  sm: '6px',
  md: '10px',
  lg: '12px',
  xl: '16px',
  xxl: '20px',
  pill: '500px',
  round: '50%',
};

export const TYPOGRAPHY = {
  fontFamily: {
    primary: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading: 'inherit',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    md: '18px',
    lg: '20px',
    xl: '24px',
    '2xl': '28px',
    '3xl': '32px',
    '4xl': '40px',
    '5xl': '50px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const SPACING = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '40px',
  '4xl': '48px',
  '5xl': '64px',
};

export const BREAKPOINTS = {
  xs: '0px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px',
};

export const TRANSITIONS = {
  fast: '0.15s ease',
  normal: '0.3s ease',
  slow: '0.5s ease',
  smooth: '0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
};

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  navbar: 10001,
  topStrip: 10000,
  mobileMenu: 10010,
};

// Helper functions
export const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getMediaQuery = (breakpoint) => {
  return `@media (min-width: ${BREAKPOINTS[breakpoint]})`;
};

export default {
  THEME_COLORS,
  GRADIENTS,
  SHADOWS,
  BORDER_RADIUS,
  TYPOGRAPHY,
  SPACING,
  BREAKPOINTS,
  TRANSITIONS,
  Z_INDEX,
  hexToRgba,
  getMediaQuery,
};
