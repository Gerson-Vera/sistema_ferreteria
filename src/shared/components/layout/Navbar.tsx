'use client';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import { SIDEBAR_WIDTH } from './Sidebar';

export default function Navbar() {
  const { data: session } = useSession();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const nombre = session?.user?.nombre ?? '';
  const username = session?.user?.username ?? '';
  const initials = nombre
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  const handleSignOut = () => {
    setAnchor(null);
    signOut({ callbackUrl: '/login' });
  };

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
        ml: `${SIDEBAR_WIDTH}px`,
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: theme => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <Typography variant="subtitle1" sx={{ flexGrow: 1, color: 'text.secondary' }}>
          Sistema de Gestión
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Notificaciones">
            <IconButton size="small">
              <NotificationsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Mi perfil">
            <IconButton size="small" onClick={e => setAnchor(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                {initials}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { minWidth: 220, mt: 1, boxShadow: 3 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: 16 }}>
              {initials}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {nombre || 'Usuario'}
              </Typography>
              {username && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  @{username}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Divider />

        <MenuItem onClick={() => setAnchor(null)} sx={{ py: 1 }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mi perfil</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleSignOut} sx={{ py: 1, color: 'error.main' }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Cerrar Sesión</ListItemText>
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
