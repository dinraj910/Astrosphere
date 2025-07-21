import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#818cf8', // A softer, more modern indigo
    },
    secondary: {
      main: '#f472b6', // A vibrant cosmic pink
    },
    background: {
      default: '#0c0a18', // A deep, dark purple space
      paper: 'rgba(26, 26, 61, 0.5)', // Semi-transparent for glass effect
    },
    text: {
      primary: '#e5e7eb',
      secondary: '#9ca3af',
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: {
      fontFamily: "'Orbitron', sans-serif",
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
    h2: {
      fontFamily: "'Orbitron', sans-serif",
      fontWeight: 600,
    },
    h3: {
      fontFamily: "'Orbitron', sans-serif",
      fontWeight: 500,
    },
    body1: {
      fontFamily: "'Inter', sans-serif",
      lineHeight: 1.6,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '999px', // Pill-shaped buttons
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
            color: '#fff'
          },
        },
      },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                backgroundColor: 'rgba(17, 24, 39, 0.6)', // Glassy background
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px', // Softer, modern corners
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }
        }
    }
  },
});

export default theme;
