import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5c6bc0', // Nebula indigo
    },
    secondary: {
      main: '#ff4081', // Cosmic pink
    },
    background: {
      default: '#0a0a23', // Deep space black
      paper: '#1a1a3d', // Dark nebula
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0bec5',
    },
  },
  typography: {
    fontFamily: "'Orbitron', 'Inter', sans-serif",
    h1: {
      fontFamily: 'Orbitron',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'Orbitron',
      fontWeight: 500,
    },
    body1: {
      fontFamily: 'Inter',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          textTransform: 'none',
        },
      },
    },
  },
});

export default theme;