import { createTheme } from '@mui/material/styles';

const blogTheme = createTheme({
  palette: {
    primary: {
      main: '#7BA05B',
      light: '#9AB973',
      dark: '#5B7A44',
      contrastText: '#fff',
    },
    secondary: {
      main: '#85B09A',
      light: '#A3C4B2',
      dark: '#68907C',
      contrastText: '#fff',
    },
    success: {
      main: '#90EE90',
      light: '#B5F4B5',
      dark: '#5AE55A',
      contrastText: '#1a1a1a',
    },
    info: {
      main: '#E6E6FA',
      light: '#F2F2FC',
      dark: '#A3A3ED',
      contrastText: '#1a1a1a',
    },
    background: {
      default: '#FDFDFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#5A6C7D',
      disabled: '#95A5A6',
    },
    grey: {
      50: '#F8F9FA',
      100: '#F1F3F5',
      200: '#E9ECEF',
      300: '#DEE2E6',
      400: '#CED4DA',
      500: '#ADB5BD',
      600: '#6C757D',
      700: '#495057',
      800: '#343A40',
      900: '#212529',
    },
    divider: '#E9ECEF',
  },
  typography: {
    fontFamily: '"Nunito", "Lora", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontFamily: '"Lora", serif',
      fontSize: '1.125rem',
      fontWeight: 400,
      lineHeight: 1.8,
    },
    body2: {
      fontFamily: '"Lora", serif',
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.7,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default blogTheme;
