'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main:          '#1565C0',
      light:         '#1976D2',
      dark:          '#0D47A1',
      contrastText:  '#ffffff',
    },
    secondary: {
      main:          '#F57C00',
      light:         '#FF9800',
      dark:          '#E65100',
      contrastText:  '#ffffff',
    },
    background: {
      default: '#F0F3F8',   // Fondo principal (azul-gris ERP)
      paper:   '#FFFFFF',
    },
    text: {
      primary:   '#1A2035',
      secondary: '#637381',
      disabled:  '#A0AEC0',
    },
    divider: 'rgba(0,0,0,0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 600 },
    button:  { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0,0,0,0.06)',
    '0px 1px 4px rgba(0,0,0,0.07)',
    '0px 2px 8px rgba(0,0,0,0.08)',
    '0px 2px 12px rgba(0,0,0,0.09)',
    '0px 4px 16px rgba(0,0,0,0.10)',
    '0px 4px 20px rgba(0,0,0,0.11)',
    '0px 6px 24px rgba(0,0,0,0.12)',
    '0px 6px 28px rgba(0,0,0,0.13)',
    '0px 8px 32px rgba(0,0,0,0.14)',
    '0px 8px 36px rgba(0,0,0,0.15)',
    '0px 10px 40px rgba(0,0,0,0.16)',
    '0px 10px 44px rgba(0,0,0,0.17)',
    '0px 12px 48px rgba(0,0,0,0.18)',
    '0px 12px 52px rgba(0,0,0,0.19)',
    '0px 14px 56px rgba(0,0,0,0.20)',
    '0px 14px 60px rgba(0,0,0,0.21)',
    '0px 16px 64px rgba(0,0,0,0.22)',
    '0px 16px 68px rgba(0,0,0,0.23)',
    '0px 18px 72px rgba(0,0,0,0.24)',
    '0px 18px 76px rgba(0,0,0,0.25)',
    '0px 20px 80px rgba(0,0,0,0.26)',
    '0px 20px 84px rgba(0,0,0,0.27)',
    '0px 22px 88px rgba(0,0,0,0.28)',
    '0px 22px 92px rgba(0,0,0,0.29)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 10px rgba(0,0,0,0.07)',
          border: '1px solid rgba(0,0,0,0.055)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F8FAFC',
            fontWeight: 700,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#637381',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.018)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 11.5,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          backgroundColor: '#1A2035',
        },
        arrow: {
          color: '#1A2035',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4 },
        bar:  { borderRadius: 4 },
      },
    },
  },
});

export default theme;
