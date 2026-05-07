'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { SIDEBAR_WIDTH } from './Sidebar';

type AlertaProducto = {
  id: string;
  sku: string;
  nombre: string;
  stock: number;
  stockMinimo: number;
};

function useStockAlertas() {
  const [count, setCount] = useState(0);
  const [productos, setProductos] = useState<AlertaProducto[]>([]);

  const fetchAlertas = () => {
    fetch('/api/productos/stock-bajo')
      .then(r => r.json())
      .then(json => {
        if (json.data) {
          setCount(json.data.count ?? 0);
          setProductos(json.data.productos ?? []);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchAlertas();
    const interval = setInterval(fetchAlertas, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { count, productos };
}

export default function Navbar() {
  const { data: session } = useSession();
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const { count: stockCount, productos: stockProductos } = useStockAlertas();

  const nombre = session?.user?.nombre ?? '';
  const username = session?.user?.username ?? '';
  const initials = nombre
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  const handleSignOut = () => {
    setUserAnchor(null);
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
          <Tooltip title={stockCount > 0 ? `${stockCount} productos con stock bajo` : 'Sin alertas'}>
            <IconButton size="small" onClick={e => setNotifAnchor(e.currentTarget)}>
              <Badge badgeContent={stockCount || null} color="warning" max={99}>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Mi perfil">
            <IconButton size="small" onClick={e => setUserAnchor(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                {initials}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* Notificaciones de stock bajo */}
      <Popover
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={() => setNotifAnchor(null)}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        slotProps={{ paper: { sx: { width: 340, maxHeight: 400, mt: 1, boxShadow: 3 } } }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Alertas de Stock
          </Typography>
        </Box>
        {stockProductos.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No hay productos con stock bajo
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
            {stockProductos.slice(0, 20).map(p => (
              <Box
                key={p.id}
                sx={{
                  px: 2, py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <WarningAmberIcon fontSize="small" color="warning" sx={{ flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                    {p.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Stock: {p.stock} · Mínimo: {p.stockMinimo}
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  sx={{ ml: 'auto', flexShrink: 0, alignItems: 'center' }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      px: 0.75, py: 0.25,
                      borderRadius: 1,
                      bgcolor: 'warning.light',
                      color: 'warning.dark',
                      fontWeight: 600,
                    }}
                  >
                    {p.stock}/{p.stockMinimo}
                  </Typography>
                </Stack>
              </Box>
            ))}
            {stockProductos.length > 20 && (
              <Box sx={{ px: 2, py: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  +{stockProductos.length - 20} productos más
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Popover>

      {/* Menú de usuario */}
      <Menu
        anchorEl={userAnchor}
        open={Boolean(userAnchor)}
        onClose={() => setUserAnchor(null)}
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

        <MenuItem onClick={() => setUserAnchor(null)} sx={{ py: 1 }}>
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
