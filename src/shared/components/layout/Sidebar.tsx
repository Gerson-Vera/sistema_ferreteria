'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import BarChartIcon from '@mui/icons-material/BarChart';
import CategoryIcon from '@mui/icons-material/Category';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StraightenIcon from '@mui/icons-material/Straighten';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TuneIcon from '@mui/icons-material/Tune';
import Logo from '@/shared/components/ui/Logo';

export const SIDEBAR_WIDTH = 240;

const ROL_LABEL: Record<string, string> = {
  ADMIN:    'Administrador',
  VENDEDOR: 'Vendedor',
  ALMACEN:  'Almacenero',
};

const navSections = [
  {
    label: 'Principal',
    items: [
      { label: 'Dashboard',      href: '/dashboard',                    icon: <DashboardIcon />,    codigo: 'DASHBOARD' },
    ],
  },
  {
    label: 'Inventario',
    items: [
      { label: 'Productos',      href: '/dashboard/productos',          icon: <InventoryIcon />,    codigo: 'PRODUCTOS' },
      { label: 'Categorías',     href: '/dashboard/categorias',         icon: <CategoryIcon />,     codigo: 'CATEGORIAS' },
      { label: 'Unidades Medida',href: '/dashboard/unidades-medida',    icon: <StraightenIcon />,   codigo: 'UNID_MED' },
      { label: 'Movimientos',    href: '/dashboard/movimientos',        icon: <SwapHorizIcon />,    codigo: 'MOVIMIENTOS' },
      { label: 'Ajustes Inv.',   href: '/dashboard/ajustes-inventario', icon: <TuneIcon />,         codigo: 'AJUSTES_INV' },
    ],
  },
  {
    label: 'Compras',
    items: [
      { label: 'Proveedores',    href: '/dashboard/proveedores',        icon: <LocalShippingIcon />,codigo: 'PROVEEDORES' },
      { label: 'Compras',        href: '/dashboard/compras',            icon: <ShoppingCartIcon />, codigo: 'COMPRAS' },
    ],
  },
  {
    label: 'Ventas',
    items: [
      { label: 'Clientes',       href: '/dashboard/clientes',           icon: <PeopleIcon />,       codigo: 'CLIENTES' },
      { label: 'Ventas',         href: '/dashboard/ventas',             icon: <PointOfSaleIcon />,  codigo: 'VENTAS' },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { label: 'Reportes',       href: '/dashboard/reportes',           icon: <BarChartIcon />,     codigo: 'REPORTES' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [allowedCodes, setAllowedCodes] = useState<string[] | null>(null);

  useEffect(() => {
    fetch('/api/menus')
      .then(r => r.json())
      .then(json => setAllowedCodes(json.data ?? []))
      .catch(() => setAllowedCodes([]));
  }, []);

  const visibleSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(
        item => allowedCodes === null || allowedCodes.includes(item.codigo),
      ),
    }))
    .filter(section => section.items.length > 0);

  const rolCodigo = (session?.user?.roles as string[] | undefined)?.[0] ?? '';
  const rolLabel  = ROL_LABEL[rolCodigo] ?? rolCodigo;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 2, py: 2, display: 'flex', justifyContent: 'center' }}>
        <Logo width={160} height={56} />
      </Box>

      <Divider />

      {/* Menús */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {allowedCodes === null ? (
          // Skeleton mientras carga
          <Box sx={{ px: 2, pt: 2 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={36} sx={{ mb: 0.5, borderRadius: 1.5 }} />
            ))}
          </Box>
        ) : (
          visibleSections.map(section => (
            <Box key={section.label}>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ px: 2, pt: 2, pb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}
              >
                {section.label}
              </Typography>
              <List dense disablePadding>
                {section.items.map(item => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <ListItem key={item.href} disablePadding sx={{ px: 1 }}>
                      <ListItemButton
                        component={NextLink}
                        href={item.href}
                        selected={active}
                        sx={{
                          borderRadius: 1.5,
                          mb: 0.5,
                          '&.Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                            '&:hover': { bgcolor: 'primary.dark' },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          ))
        )}
      </Box>

      {/* Rol del usuario al pie */}
      {rolLabel && (
        <>
          <Divider />
          <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'center' }}>
            <Chip label={rolLabel} size="small" color="primary" variant="outlined" />
          </Box>
        </>
      )}
    </Drawer>
  );
}
