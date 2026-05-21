'use client';
import Box from '@mui/material/Box';
import {
  HomeIcon,
  ChartBarSquareIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';

type Props = {
  active: number;
  onChange: (tab: number) => void;
};

const TABS = [
  { label: 'Inicio',           Icon: HomeIcon             },
  { label: 'Panel de Control', Icon: ChartBarSquareIcon   },
  { label: 'Reportes',         Icon: DocumentChartBarIcon },
];

export default function TabsNav({ active, onChange }: Props) {
  return (
    <Box
      sx={{
        px: { xs: 3, md: 5 },
        display: 'flex',
        gap: 0,
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid rgba(44,62,80,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 1px 4px rgba(44,62,80,0.06)',
      }}
    >
      {TABS.map(({ label, Icon }, idx) => {
        const isActive = idx === active;
        return (
          <Box
            key={label}
            component="button"
            onClick={() => onChange(idx)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: { xs: 2, md: 2.5 },
              py: 1.75,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              position: 'relative',
              color: isActive ? '#F39C12' : '#95A5A6',
              fontFamily: 'var(--font-geist, Geist, sans-serif)',
              fontSize: 13.5,
              fontWeight: isActive ? 600 : 400,
              transition: 'color 0.18s ease',
              whiteSpace: 'nowrap',
              '&:hover': { color: isActive ? '#F39C12' : '#2C3E50' },
              '&::after': isActive ? {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2px',
                bgcolor: '#F39C12',
                borderRadius: '2px 2px 0 0',
              } : {},
            }}
          >
            <Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
            {label}
          </Box>
        );
      })}
    </Box>
  );
}
