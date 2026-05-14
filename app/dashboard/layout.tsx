import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { SidebarProvider } from '@/shared/context/SidebarContext';
import Navbar from '@/shared/components/layout/Navbar';
import Sidebar from '@/shared/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Navbar />
          <Toolbar sx={{ minHeight: '64px !important', flexShrink: 0 }} />
          <Box sx={{ flexGrow: 1, p: 3 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </SidebarProvider>
  );
}
