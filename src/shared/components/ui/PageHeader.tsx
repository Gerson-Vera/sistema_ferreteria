import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C3E50' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: '#95A5A6', mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
}
