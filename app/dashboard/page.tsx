'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Box from '@mui/material/Box';
import WelcomeHeader from '@/shared/components/dashboard/WelcomeHeader';
import TabsNav      from '@/shared/components/dashboard/TabsNav';
import InicioTab    from '@/shared/components/dashboard/InicioTab';
import PanelControl from '@/shared/components/dashboard/PanelControl';
import ReportesTab  from '@/shared/components/dashboard/ReportesTab';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState(0);

  const nombre = session?.user?.nombre ?? null;
  const rol    = session?.user?.roles?.[0] ?? 'ADMIN';

  return (
    <Box
      sx={{
        mx: -3,
        mt: -3,
        mb: -3,
        minHeight: 'calc(100vh - 64px)',
        bgcolor: '#ECF0F1',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <WelcomeHeader nombre={nombre} rol={rol} />
      <TabsNav active={tab} onChange={setTab} />

      <Box
        key={tab}
        sx={{
          flex: 1,
          animation: 'fadeSlide 0.26s ease',
          '@keyframes fadeSlide': {
            from: { opacity: 0, transform: 'translateY(6px)' },
            to:   { opacity: 1, transform: 'translateY(0)'   },
          },
        }}
      >
        {tab === 0 && <InicioTab />}
        {tab === 1 && <PanelControl rol={rol} />}
        {tab === 2 && <ReportesTab rol={rol} />}
      </Box>
    </Box>
  );
}
