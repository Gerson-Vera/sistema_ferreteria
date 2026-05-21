import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import type { SxProps } from '@mui/material/styles';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  sx?: SxProps;
};

const colorMap = {
  primary:   { bg: 'rgba(243,156,18,0.12)',  icon: '#F39C12'  },
  secondary: { bg: 'rgba(44,62,80,0.10)',    icon: '#2C3E50'  },
  success:   { bg: 'rgba(39,174,96,0.12)',   icon: '#27AE60'  },
  warning:   { bg: 'rgba(243,156,18,0.12)',  icon: '#E67E22'  },
  error:     { bg: 'rgba(231,76,60,0.12)',   icon: '#E74C3C'  },
  info:      { bg: 'rgba(41,128,185,0.12)',  icon: '#2980B9'  },
};

export default function StatCard({ title, value, subtitle, icon, color = 'primary', sx }: Props) {
  const { bg, icon: iconColor } = colorMap[color];
  return (
    <Card sx={sx}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{ color: '#95A5A6', fontWeight: 500, mb: 0.75, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', lineHeight: 1.1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: '#95A5A6', mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: bg,
              color: iconColor,
              borderRadius: '10px',
              p: 1.25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
