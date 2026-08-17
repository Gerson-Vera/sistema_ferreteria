'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { SIDEBAR_WIDTH, SIDEBAR_MINI } from './Sidebar';
import { useSidebar } from '@/shared/context/SidebarContext';

// ─── Metadata por ruta ────────────────────────────────────────────────────────
const PAGE_META: Record<string, { title: string; section?: string }> = {
  '/dashboard':                    { title: 'Dashboard' },
  '/dashboard/productos':          { title: 'Productos',            section: 'Inventario' },
  '/dashboard/categorias':         { title: 'Categorías',           section: 'Inventario' },
  '/dashboard/marcas':             { title: 'Marcas',               section: 'Inventario' },
  '/dashboard/unidades-medida':    { title: 'Unidades de Medida',   section: 'Inventario' },
  '/dashboard/almacenes':          { title: 'Almacenes',            section: 'Inventario' },
  '/dashboard/movimientos':        { title: 'Movimientos',          section: 'Inventario' },
  '/dashboard/ajustes-inventario':          { title: 'Ajustes de Inventario',     section: 'Inventario' },
  '/dashboard/control-stock':               { title: 'Control de Stock',           section: 'Inventario' },
  '/dashboard/stock-almacenes':             { title: 'Stock por Almacén',          section: 'Inventario' },
  '/dashboard/transferencias':              { title: 'Transferencias',             section: 'Inventario' },
  '/dashboard/conteos-inventario':          { title: 'Conteos de Inventario',      section: 'Inventario' },
  '/dashboard/planificacion-inventario':    { title: 'Planificación de Inventario',section: 'Inventario' },
  '/dashboard/rotacion-inventario':         { title: 'Rotación de Inventario',     section: 'Inventario' },
  '/dashboard/proveedores':        { title: 'Proveedores',              section: 'Compras' },
  '/dashboard/ordenes-compra':     { title: 'Órdenes a Proveedor',      section: 'Compras' },
  '/dashboard/compras':            { title: 'Compras (Facturas)',        section: 'Compras' },
  '/dashboard/clientes':           { title: 'Clientes',             section: 'Ventas'     },
  '/dashboard/ventas':             { title: 'Ventas',               section: 'Ventas'     },
  '/dashboard/cajas':              { title: 'Cajas',                section: 'Ventas'     },
  '/dashboard/devoluciones':       { title: 'Devoluciones',         section: 'Ventas'     },
  '/dashboard/despachos':          { title: 'Despachos y Entregas', section: 'Ventas'     },
  '/dashboard/reportes':           { title: 'Reportes & Análisis',  section: 'Análisis'   },
};

type AlertaProducto = {
  id: string; sku: string; nombre: string; stock: number; stockMinimo: number;
};

function useStockAlertas() {
  const [count, setCount]         = useState(0);
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
    const id = setInterval(fetchAlertas, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return { count, productos };
}

export default function Navbar() {
  const { data: session }                         = useSession();
  const pathname                                   = usePathname();
  const { open, toggle }                           = useSidebar();
  const [userAnchor, setUserAnchor]               = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor]             = useState<null | HTMLElement>(null);
  const { count: stockCount, productos: stockProductos } = useStockAlertas();

  const nombre   = session?.user?.nombre ?? '';
  const username = session?.user?.username ?? '';
  const initials = nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'U';

  const sidebarWidth = open ? SIDEBAR_WIDTH : SIDEBAR_MINI;
  const meta         = PAGE_META[pathname] ?? { title: 'Sistema' };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${sidebarWidth}px)`,
        ml: `${sidebarWidth}px`,
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid rgba(44,62,80,0.1)',
        color: 'text.primary',
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), margin-left 0.22s cubic-bezier(0.4,0,0.2,1)',
        zIndex: theme => theme.zIndex.drawer - 1,
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', px: { xs: 2, sm: 3 }, gap: 2 }}>

        {/* Toggle sidebar */}
        <Tooltip title={open ? 'Contraer menú' : 'Expandir menú'}>
          <IconButton
            size="small"
            onClick={toggle}
            sx={{
              color: '#2C3E50',
              border: '1px solid rgba(44,62,80,0.15)',
              borderRadius: '8px',
              width: 34,
              height: 34,
              flexShrink: 0,
              '&:hover': { bgcolor: '#ECF0F1', borderColor: '#95A5A6' },
            }}
          >
            <MenuIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* Breadcrumbs */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Breadcrumbs
            separator="›"
            sx={{
              '& .MuiBreadcrumbs-separator': { color: 'text.disabled', mx: 0.75 },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <HomeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography sx={{ fontSize: 12.5, color: 'text.disabled' }}>Inicio</Typography>
            </Box>
            {meta.section && (
              <Typography sx={{ fontSize: 12.5, color: 'text.disabled' }}>
                {meta.section}
              </Typography>
            )}
            <Typography sx={{ fontSize: 12.5, color: 'text.primary', fontWeight: 600 }}>
              {meta.title}
            </Typography>
          </Breadcrumbs>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: 17,
              lineHeight: 1.2,
              color: '#2C3E50',
              mt: 0.25,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {meta.title}
          </Typography>
        </Box>

        {/* ── Acciones ────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>

          {/* Notificaciones */}
          <Tooltip title={stockCount > 0 ? `${stockCount} productos con stock bajo` : 'Sin alertas'}>
            <IconButton
              size="small"
              onClick={e => setNotifAnchor(e.currentTarget)}
              sx={{
                width: 38,
                height: 38,
                border: '1px solid rgba(44,62,80,0.12)',
                borderRadius: '10px',
                color: '#2C3E50',
                '&:hover': { bgcolor: '#ECF0F1' },
              }}
            >
              <Badge
                badgeContent={stockCount || null}
                color="warning"
                max={99}
                sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}
              >
                <NotificationsOutlinedIcon sx={{ fontSize: 19 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Box sx={{ width: 1, height: 24, bgcolor: 'rgba(0,0,0,0.1)' }} />

          {/* Avatar de usuario */}
          <Tooltip title="Mi cuenta">
            <Box
              onClick={e => setUserAnchor(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                borderRadius: '10px',
                px: 1,
                py: 0.5,
                border: '1px solid rgba(44,62,80,0.12)',
                transition: 'background-color 0.15s',
                '&:hover': { bgcolor: '#ECF0F1' },
              }}
            >
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  background: 'linear-gradient(135deg, #F39C12 0%, #D68910 100%)',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.2, color: '#2C3E50' }}>
                  {nombre || 'Usuario'}
                </Typography>
                {username && (
                  <Typography sx={{ fontSize: 10.5, color: 'text.disabled', lineHeight: 1.2 }}>
                    @{username}
                  </Typography>
                )}
              </Box>
            </Box>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* ── Popover: alertas de stock ──────────────────────────────────────── */}
      <Popover
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={() => setNotifAnchor(null)}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxHeight: 440,
              mt: 1,
              borderRadius: '12px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
              border: '1px solid rgba(0,0,0,0.07)',
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0,0,0,0.07)',
            bgcolor: '#F4F6F7',
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2C3E50' }}>
              Alertas de Stock
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Productos por debajo del mínimo
            </Typography>
          </Box>
          {stockCount > 0 && (
            <Chip
              label={stockCount}
              size="small"
              color="warning"
              sx={{ height: 22, fontSize: 11, fontWeight: 700 }}
            />
          )}
        </Box>

        {stockProductos.length === 0 ? (
          <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No hay productos con stock bajo
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 340, overflowY: 'auto' }}>
            {stockProductos.slice(0, 20).map((p, i) => (
              <Box
                key={p.id}
                sx={{
                  px: 2.5,
                  py: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  borderBottom: i < stockProductos.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                  '&:hover': { bgcolor: '#F4F6F7' },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: 'rgba(243,156,18,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <WarningAmberIcon sx={{ fontSize: 17, color: '#F39C12' }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 600, fontSize: 13 }}>
                    {p.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    SKU: {p.sku}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: p.stock === 0 ? '#EF4444' : '#F59E0B',
                    }}
                  >
                    {p.stock}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    min {p.stockMinimo}
                  </Typography>
                </Box>
              </Box>
            ))}
            {stockProductos.length > 20 && (
              <Box sx={{ px: 2, py: 1.25, textAlign: 'center', bgcolor: '#FAFBFC' }}>
                <Typography variant="caption" color="text.secondary">
                  +{stockProductos.length - 20} productos más
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Popover>

      {/* ── Menu usuario ──────────────────────────────────────────────────── */}
      <Menu
        anchorEl={userAnchor}
        open={Boolean(userAnchor)}
        onClose={() => setUserAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 240,
              mt: 1,
              borderRadius: '12px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
              border: '1px solid rgba(0,0,0,0.07)',
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box sx={{ px: 2.5, py: 2, bgcolor: '#F4F6F7', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 42,
                height: 42,
                background: 'linear-gradient(135deg, #F39C12 0%, #D68910 100%)',
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#2C3E50' }}>
                {nombre || 'Usuario'}
              </Typography>
              {username && (
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  @{username}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <MenuItem onClick={() => setUserAnchor(null)} sx={{ py: 1.25, px: 2 }}>
          <ListItemIcon>
            <ManageAccountsIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          </ListItemIcon>
          <ListItemText
            primary="Mi perfil"
            slotProps={{ primary: { sx: { fontSize: 13.5 } } }}
          />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => { setUserAnchor(null); signOut({ callbackUrl: '/login' }); }}
          sx={{ py: 1.25, px: 2, color: 'error.main' }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText
            primary="Cerrar Sesión"
            slotProps={{ primary: { sx: { fontSize: 13.5, color: 'error.main' } } }}
          />
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
