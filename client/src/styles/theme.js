import { createTheme } from '@mui/material/styles';

export const createResponsiveTheme = () => {
  return createTheme({
    palette: {
      mode: 'dark',
      primary: { 
        main: '#4c63d2',
        light: '#7c8cdc',
        dark: '#2a3a9e'
      },
      secondary: { 
        main: '#7c3aed',
        light: '#9f67f1',
        dark: '#4c1d95'
      },
      background: {
        default: '#0f172a',
        paper: '#1e293b'
      },
      text: {
        primary: '#ffffff',
        secondary: '#94a3b8'
      },
      error: {
        main: '#ef4444'
      },
      warning: {
        main: '#f59e0b'
      },
      success: {
        main: '#10b981'
      }
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 700,
        fontSize: '3rem',
        letterSpacing: '0.05em',
        '@media (max-width:900px)': {
          fontSize: '2.5rem',
        },
        '@media (max-width:600px)': {
          fontSize: '1.8rem',
        },
        '@media (max-width:400px)': {
          fontSize: '1.5rem',
        },
      },
      h2: {
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 600,
        fontSize: '2.5rem',
        '@media (max-width:900px)': {
          fontSize: '2rem',
        },
        '@media (max-width:600px)': {
          fontSize: '1.5rem',
        },
      },
      h3: {
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 500,
        fontSize: '2rem',
        '@media (max-width:600px)': {
          fontSize: '1.25rem',
        },
      },
      h4: {
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 500,
        fontSize: '1.75rem',
        '@media (max-width:600px)': {
          fontSize: '1.1rem',
        },
      },
      h5: {
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 500,
        fontSize: '1.5rem',
        '@media (max-width:600px)': {
          fontSize: '1rem',
        },
      },
      h6: {
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 500,
        fontSize: '1.25rem',
        '@media (max-width:600px)': {
          fontSize: '0.9rem',
        },
      },
      body1: {
        fontFamily: "'Inter', sans-serif",
        fontSize: '1rem',
        lineHeight: 1.6,
        '@media (max-width:600px)': {
          fontSize: '0.875rem',
        },
      },
      body2: {
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.875rem',
        '@media (max-width:600px)': {
          fontSize: '0.8rem',
        },
      }
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    components: {
      MuiContainer: {
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              paddingLeft: '8px',
              paddingRight: '8px',
            },
            '@media (min-width:600px) and (max-width:900px)': {
              paddingLeft: '16px',
              paddingRight: '16px',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(17, 24, 39, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            '@media (max-width:600px)': {
              margin: '8px',
              borderRadius: '12px',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '999px',
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 24px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '@media (max-width:600px)': {
              padding: '8px 16px',
              fontSize: '0.875rem',
            },
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
              color: '#fff'
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              margin: '4px',
            },
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              textAlign: 'left', // Ensure readability on mobile
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              minHeight: '40px',
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              minWidth: '60px',
              padding: '6px 8px',
              fontSize: '0.75rem',
            },
          },
        },
      },
    },
  });
};

// Keep the original theme as default export for backward compatibility
const theme = createResponsiveTheme();

export default theme;