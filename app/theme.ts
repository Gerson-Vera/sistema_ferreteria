'use client';
import { createTheme } from '@mui/material/styles';

// ─── Design System tokens ────────────────────────────────────────────────────
const DS = {
  primary:   '#F39C12',   // amber/orange — CTA, active highlights
  secondary: '#2C3E50',   // dark navy — sidebar, headings, text
  tertiary:  '#95A5A6',   // blue-gray — muted text, icons
  neutral:   '#ECF0F1',   // near-white — page background, inputs
  white:     '#FFFFFF',
};

const theme = createTheme({
  palette: {
    primary: {
      main:         DS.primary,
      light:        '#F5B041',
      dark:         '#D68910',
      contrastText: DS.white,
    },
    secondary: {
      main:         DS.secondary,
      light:        '#34495E',
      dark:         '#1A252F',
      contrastText: DS.white,
    },
    background: {
      default: DS.neutral,
      paper:   DS.white,
    },
    text: {
      primary:   DS.secondary,
      secondary: DS.tertiary,
      disabled:  '#BDC3C7',
    },
    divider: 'rgba(44,62,80,0.1)',
    success: {
      main:         '#27AE60',
      light:        '#2ECC71',
      dark:         '#1E8449',
      contrastText: DS.white,
    },
    warning: {
      main:         '#E67E22',
      light:        DS.primary,
      dark:         '#CA6F1E',
      contrastText: DS.white,
    },
    error: {
      main:         '#E74C3C',
      light:        '#EC7063',
      dark:         '#C0392B',
      contrastText: DS.white,
    },
    info: {
      main:         '#2980B9',
      light:        '#3498DB',
      dark:         '#1F618D',
      contrastText: DS.white,
    },
  },

  typography: {
    fontFamily: 'var(--font-geist, "Geist", "Inter", "Helvetica", "Arial", sans-serif)',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },

  shape: { borderRadius: 8 },

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
          boxShadow: '0px 2px 12px rgba(44,62,80,0.07)',
          border: '1px solid rgba(44,62,80,0.08)',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F4F6F7',
            fontWeight: 700,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: DS.tertiary,
            borderBottom: '1px solid rgba(44,62,80,0.1)',
            fontFamily: 'var(--font-jetbrains-mono, "JetBrains Mono", monospace)',
          },
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: 'rgba(243,156,18,0.025)' },
        },
      },
    },

    MuiTextField: {
      defaultProps: { size: 'small' },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: DS.white,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: DS.tertiary,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: DS.primary,
            borderWidth: 2,
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 11.5,
          fontFamily: 'var(--font-jetbrains-mono, "JetBrains Mono", monospace)',
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          backgroundColor: DS.secondary,
        },
        arrow: { color: DS.secondary },
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
