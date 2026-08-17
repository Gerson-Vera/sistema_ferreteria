'use client';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

type Props = {
  nombre?: string | null;
  rol?: string | null;
};

const ROL_LABEL: Record<string, string> = {
  ADMIN:    'Administrador',
  VENDEDOR: 'Vendedor',
  ALMACEN:  'Almacenero',
  CAJERO:   'Cajero',
  CONTADOR: 'Contador',
};

function getGreeting(hour: number): string {
  if (hour < 12) return '¡Buenos días';
  if (hour < 18) return '¡Buenas tardes';
  return '¡Buenas noches';
}

function getPeruHour(): number {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Lima' })
  ).getHours();
}

function formatPeruDate(): string {
  return new Date().toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function WelcomeHeader({ nombre, rol }: Props) {
  const [greeting, setGreeting] = useState('¡Bienvenido');
  const [dateStr, setDateStr]   = useState('');

  useEffect(() => {
    setGreeting(getGreeting(getPeruHour()));
    setDateStr(formatPeruDate());
    const id = setInterval(() => setGreeting(getGreeting(getPeruHour())), 60_000);
    return () => clearInterval(id);
  }, []);

  const rolLabel = ROL_LABEL[rol ?? ''] ?? rol ?? '';

  return (
    <Box
      sx={{
        px: { xs: 3, md: 5 },
        pt: 3.5,
        pb: 3,
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid rgba(44,62,80,0.1)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
        <Typography
          sx={{
            fontFamily: 'var(--font-barlow, "Barlow Condensed", Geist, sans-serif)',
            fontSize: { xs: 20, md: 26 },
            fontWeight: 700,
            color: '#2C3E50',
            lineHeight: 1.2,
          }}
        >
          {greeting},{' '}
          <Box component="span" sx={{ color: '#F39C12' }}>
            {nombre ?? 'Usuario'}
          </Box>
          !
        </Typography>
        {rolLabel && (
          <Chip
            label={rolLabel}
            size="small"
            sx={{
              bgcolor: 'rgba(243,156,18,0.1)',
              color: '#D68910',
              border: '1px solid rgba(243,156,18,0.3)',
              fontWeight: 600,
              fontSize: 11,
              height: 22,
              borderRadius: '6px',
              fontFamily: 'var(--font-jetbrains-mono, monospace)',
            }}
          />
        )}
      </Box>

      <Typography sx={{ fontSize: 13.5, color: '#95A5A6', mb: 0.25 }}>
        Bienvenido al Sistema de Gestión de Inversiones Andrew Valentino E.I.R.L.
      </Typography>

      {dateStr && (
        <Typography
          sx={{
            fontSize: 11.5,
            color: '#BDC3C7',
            textTransform: 'capitalize',
            fontFamily: 'var(--font-jetbrains-mono, monospace)',
          }}
        >
          {dateStr}
        </Typography>
      )}
    </Box>
  );
}
