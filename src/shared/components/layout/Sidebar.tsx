'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import Image from 'next/image';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import GroupsIcon from '@mui/icons-material/Groups';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LabelIcon from '@mui/icons-material/Label';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LogoutIcon from '@mui/icons-material/Logout';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ScaleIcon from '@mui/icons-material/Scale';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SpeedIcon from '@mui/icons-material/Speed';
import TuneIcon from '@mui/icons-material/Tune';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import { useSidebar } from '@/shared/context/SidebarContext';

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_MINI  = 68;

// ─── Design tokens — ERP Light ─────────────────────────────────────────────────
const T = {
  bg:           '#FFFFFF',
  header:       '#F8FAFC',
  border:       '#E2E8F0',
  section:      '#94A3B8',
  textNav:      '#475569',
  textActive:   '#1565C0',
  iconIdle:     '#94A3B8',
  iconActive:   '#1565C0',
  activeBg:     'rgba(21,101,192,0.08)',
  activeBorder: '#1565C0',
  hover:        'rgba(0,0,0,0.038)',
  divider:      '#E8EDF3',
  footer:       '#F8FAFC',
  scroll:       'rgba(0,0,0,0.08)',
} as const;

const ROL_LABEL: Record<string, string> = {
  ADMIN:    'Administrador',
  VENDEDOR: 'Vendedor',
  ALMACEN:  'Almacenero',
};

const ROL_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  ADMIN:    { bg: 'rgba(21,101,192,0.09)',  text: '#1565C0', border: 'rgba(21,101,192,0.22)'  },
  VENDEDOR: { bg: 'rgba(5,150,105,0.09)',   text: '#065F46', border: 'rgba(5,150,105,0.22)'   },
  ALMACEN:  { bg: 'rgba(217,119,6,0.09)',   text: '#92400E', border: 'rgba(217,119,6,0.22)'   },
};

const NAV_SECTIONS = [
  {
    label: 'General',
    items: [
      { label: 'Dashboard',          href: '/dashboard',                    icon: SpeedIcon,         codigo: 'DASHBOARD'   },
    ],
  },
  {
    label: 'Inventario',
    items: [
      { label: 'Productos',          href: '/dashboard/productos',          icon: Inventory2Icon,    codigo: 'PRODUCTOS'   },
      { label: 'Categorías',         href: '/dashboard/categorias',         icon: AccountTreeIcon,   codigo: 'CATEGORIAS'  },
      { label: 'Marcas',             href: '/dashboard/marcas',             icon: LabelIcon,         codigo: 'MARCAS'      },
      { label: 'Unidades de Medida', href: '/dashboard/unidades-medida',    icon: ScaleIcon,         codigo: 'UNID_MED'    },
      { label: 'Almacenes',          href: '/dashboard/almacenes',          icon: WarehouseIcon,     codigo: 'ALMACENES'   },
      { label: 'Movimientos',        href: '/dashboard/movimientos',        icon: CompareArrowsIcon, codigo: 'MOVIMIENTOS' },
      { label: 'Ajustes Inventario', href: '/dashboard/ajustes-inventario', icon: TuneIcon,          codigo: 'AJUSTES_INV' },
    ],
  },
  {
    label: 'Compras',
    items: [
      { label: 'Proveedores',        href: '/dashboard/proveedores',        icon: LocalShippingIcon, codigo: 'PROVEEDORES' },
      { label: 'Órdenes de Compra',  href: '/dashboard/compras',            icon: ShoppingCartIcon,  codigo: 'COMPRAS'     },
    ],
  },
  {
    label: 'Ventas',
    items: [
      { label: 'Clientes',           href: '/dashboard/clientes',           icon: GroupsIcon,        codigo: 'CLIENTES'    },
      { label: 'Ventas',             href: '/dashboard/ventas',             icon: ReceiptLongIcon,   codigo: 'VENTAS'      },
      { label: 'Cajas',              href: '/dashboard/cajas',              icon: PointOfSaleIcon,   codigo: 'CAJAS'       },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { label: 'Reportes',           href: '/dashboard/reportes',           icon: AssessmentIcon,    codigo: 'REPORTES'    },
    ],
  },
];

// ─── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({
  label, href, IconComp, active, mini,
}: {
  label: string;
  href: string;
  IconComp: React.ElementType;
  active: boolean;
  mini: boolean;
}) {
  const button = (
    <ListItemButton
      component={NextLink}
      href={href}
      sx={{
        borderRadius: '8px',
        minHeight: 40,
        px: mini ? 0 : 1.25,
        justifyContent: mini ? 'center' : 'flex-start',
        position: 'relative',
        color: active ? T.textActive : T.textNav,
        bgcolor: active ? T.activeBg : 'transparent',
        transition: 'background-color 0.14s',
        '&:hover': {
          bgcolor: active ? T.activeBg : T.hover,
        },
        ...(active && !mini && {
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '14%',
            height: '72%',
            width: '3px',
            borderRadius: '0 4px 4px 0',
            bgcolor: T.activeBorder,
          },
        }),
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: mini ? 0 : 34,
          color: active ? T.iconActive : T.iconIdle,
          transition: 'color 0.14s',
          justifyContent: 'center',
        }}
      >
        <IconComp sx={{ fontSize: 18 }} />
      </ListItemIcon>

      {!mini && (
        <ListItemText
          primary={label}
          slotProps={{
            primary: {
              sx: {
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                lineHeight: 1.4,
                color: active ? T.textActive : T.textNav,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            },
          }}
        />
      )}
    </ListItemButton>
  );

  return mini ? (
    <Tooltip title={label} placement="right" arrow>
      {button}
    </Tooltip>
  ) : button;
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { open } = useSidebar();
  const [allowedCodes, setAllowedCodes] = useState<string[] | null>(null);

  useEffect(() => {
    fetch('/api/menus')
      .then(r => r.json())
      .then(json => setAllowedCodes(json.data ?? []))
      .catch(() => setAllowedCodes([]));
  }, []);

  const visibleSections = NAV_SECTIONS
    .map(s => ({
      ...s,
      items: s.items.filter(
        item => allowedCodes === null || allowedCodes.includes(item.codigo),
      ),
    }))
    .filter(s => s.items.length > 0);

  const rolCodigo = session?.user?.roles?.[0] ?? '';
  const rolLabel  = ROL_LABEL[rolCodigo] ?? rolCodigo;
  const rolBadge  = ROL_BADGE[rolCodigo] ?? { bg: 'rgba(100,116,139,0.09)', text: '#475569', border: 'rgba(100,116,139,0.2)' };

  const nombre   = session?.user?.nombre ?? '';
  const username = session?.user?.username ?? '';
  const initials = nombre.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || 'U';

  const paperWidth = open ? SIDEBAR_WIDTH : SIDEBAR_MINI;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: paperWidth,
        flexShrink: 0,
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        '& .MuiDrawer-paper': {
          width: paperWidth,
          boxSizing: 'border-box',
          bgcolor: T.bg,
          borderRight: `1px solid ${T.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: 'none',
        },
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          height: 64,
          bgcolor: T.header,
          borderBottom: `1px solid ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: open ? 2 : 0,
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {open ? (
          <Box sx={{ position: 'relative', width: 160, height: 44 }}>
            <Image
              src="/logo/img/logo-ferreteria.png"
              alt="Logo Ferretería"
              fill
              style={{ objectFit: 'contain', objectPosition: 'left center' }}
              priority
            />
          </Box>
        ) : (
          /* Mini: inicial del logo */
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: '#1565C0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 18, lineHeight: 1 }}>
              F
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Navegación ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 1,
          '&::-webkit-scrollbar':       { width: 3 },
          '&::-webkit-scrollbar-thumb': { bgcolor: T.scroll, borderRadius: 4 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        }}
      >
        {allowedCodes === null ? (
          <Box sx={{ px: 1.5, pt: 1.5 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={36}
                sx={{ mb: 0.75, borderRadius: '8px', bgcolor: 'rgba(0,0,0,0.05)' }}
              />
            ))}
          </Box>
        ) : (
          visibleSections.map((section, sIdx) => (
            <Box key={section.label} sx={{ mb: 0.5 }}>
              {/* Label de sección */}
              {open ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    pt: sIdx === 0 ? 1.25 : 2,
                    pb: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: T.section,
                      whiteSpace: 'nowrap',
                      lineHeight: 1,
                    }}
                  >
                    {section.label}
                  </Typography>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: T.divider }} />
                </Box>
              ) : (
                sIdx > 0 && (
                  <Divider sx={{ my: 1, mx: 1.5, borderColor: T.divider }} />
                )
              )}

              <List dense disablePadding sx={{ px: 1.25 }}>
                {section.items.map(item => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <ListItem key={item.href} disablePadding sx={{ mb: 0.25 }}>
                      <NavItem
                        label={item.label}
                        href={item.href}
                        IconComp={item.icon}
                        active={active}
                        mini={!open}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          ))
        )}
      </Box>

      {/* ── Footer: usuario ──────────────────────────────────────────────── */}
      <Box
        sx={{
          borderTop: `1px solid ${T.border}`,
          bgcolor: T.footer,
          px: open ? 1.75 : 0,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'flex-start' : 'center',
          gap: 1.25,
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <Tooltip
          title={!open ? `${nombre} · ${rolLabel}` : ''}
          placement="right"
          arrow
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: '#1565C0',
              fontSize: 12.5,
              fontWeight: 700,
              flexShrink: 0,
              cursor: 'default',
            }}
          >
            {initials}
          </Avatar>
        </Tooltip>

        {open && (
          <>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                noWrap
                sx={{ color: '#1E293B', fontSize: 12.5, fontWeight: 600, lineHeight: 1.3 }}
              >
                {nombre || 'Usuario'}
              </Typography>
              {username && (
                <Typography
                  noWrap
                  sx={{ color: T.section, fontSize: 10.5, lineHeight: 1.4 }}
                >
                  @{username}
                </Typography>
              )}
              {rolLabel && (
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    mt: 0.4,
                    px: 0.75,
                    py: 0.2,
                    borderRadius: '5px',
                    bgcolor: rolBadge.bg,
                    border: `1px solid ${rolBadge.border}`,
                  }}
                >
                  <Typography sx={{ color: rolBadge.text, fontSize: 10, fontWeight: 600, lineHeight: 1.4 }}>
                    {rolLabel}
                  </Typography>
                </Box>
              )}
            </Box>

            <Tooltip title="Cerrar sesión" placement="top">
              <IconButton
                size="small"
                onClick={() => signOut({ callbackUrl: '/login' })}
                sx={{
                  color: T.section,
                  width: 30,
                  height: 30,
                  flexShrink: 0,
                  '&:hover': { color: '#DC2626', bgcolor: 'rgba(220,38,38,0.08)' },
                }}
              >
                <LogoutIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Drawer>
  );
}
