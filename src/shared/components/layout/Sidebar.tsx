'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import Image from 'next/image';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
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
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import { useSidebar } from '@/shared/context/SidebarContext';
import { getIcon } from '@/lib/icons/iconMap';

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_MINI  = 68;

// ─── Design tokens ──────────────────────────────────────────────────────────
const T = {
  bg:           '#2C3E50',
  header:       '#243342',
  border:       'rgba(255,255,255,0.08)',
  section:      'rgba(255,255,255,0.42)',
  textNav:      'rgba(255,255,255,0.72)',
  textActive:   '#FFFFFF',
  iconIdle:     'rgba(255,255,255,0.48)',
  iconActive:   '#F39C12',
  activeBg:     'rgba(243,156,18,0.16)',
  activeBorder: '#F39C12',
  hover:        'rgba(255,255,255,0.07)',
  divider:      'rgba(255,255,255,0.08)',
  footer:       '#243342',
  scroll:       'rgba(255,255,255,0.15)',
} as const;

const ROL_LABEL: Record<string, string> = {
  ADMIN:    'Administrador',
  VENDEDOR: 'Vendedor',
  ALMACEN:  'Almacenero',
};

const ROL_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  ADMIN:    { bg: 'rgba(243,156,18,0.22)',  text: '#F39C12', border: 'rgba(243,156,18,0.45)'  },
  VENDEDOR: { bg: 'rgba(46,204,113,0.18)',  text: '#2ECC71', border: 'rgba(46,204,113,0.38)'  },
  ALMACEN:  { bg: 'rgba(149,165,166,0.18)', text: '#95A5A6', border: 'rgba(149,165,166,0.38)' },
};

type MenuNode = {
  id: number;
  codigo: string;
  descripcion: string;
  url: string | null;
  icono: string | null;
  orden: number;
  menuPadreId: number | null;
  estado: boolean;
  hijos: MenuNode[];
};

// ─── NavLeaf ────────────────────────────────────────────────────────────────
function NavLeaf({ label, href, iconName, active }: {
  label: string; href: string; iconName: string | null; active: boolean;
}) {
  const Icon = getIcon(iconName);
  return (
    <ListItemButton
      component={NextLink}
      href={href}
      sx={{
        borderRadius: '7px', minHeight: 36, px: 1.25, position: 'relative',
        color: active ? T.textActive : T.textNav,
        bgcolor: active ? T.activeBg : 'transparent',
        transition: 'background-color 0.14s',
        '&:hover': { bgcolor: active ? T.activeBg : T.hover },
        ...(active && {
          '&::before': {
            content: '""', position: 'absolute', left: 0, top: '15%',
            height: '70%', width: '3px', borderRadius: '0 3px 3px 0', bgcolor: T.activeBorder,
          },
        }),
      }}
    >
      <ListItemIcon sx={{ minWidth: 28, color: active ? T.iconActive : T.iconIdle, justifyContent: 'center' }}>
        <Icon sx={{ fontSize: 15 }} />
      </ListItemIcon>
      <ListItemText
        primary={label}
        slotProps={{
          primary: {
            sx: {
              fontSize: 12.5, fontWeight: active ? 600 : 400, lineHeight: 1.4,
              color: active ? T.textActive : T.textNav,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            },
          },
        }}
      />
    </ListItemButton>
  );
}

// ─── SectionHeader ───────────────────────────────────────────────────────────
function SectionHeader({ label, iconName, isOpen, hasActive, mini, onToggle }: {
  label: string; iconName: string | null; isOpen: boolean;
  hasActive: boolean; mini: boolean; onToggle: () => void;
}) {
  const Icon = getIcon(iconName);
  const button = (
    <ListItemButton
      onClick={onToggle}
      sx={{
        borderRadius: '8px', minHeight: 42,
        px: mini ? 0 : 1.25, justifyContent: mini ? 'center' : 'flex-start',
        color: hasActive ? T.textActive : T.textNav,
        bgcolor: hasActive && !isOpen ? 'rgba(243,156,18,0.1)' : 'transparent',
        transition: 'background-color 0.14s',
        '&:hover': { bgcolor: hasActive ? 'rgba(243,156,18,0.13)' : T.hover },
      }}
    >
      <ListItemIcon sx={{ minWidth: mini ? 0 : 34, color: hasActive ? T.iconActive : T.iconIdle, justifyContent: 'center' }}>
        <Icon sx={{ fontSize: 18 }} />
      </ListItemIcon>
      {!mini && (
        <>
          <ListItemText
            primary={label}
            slotProps={{
              primary: {
                sx: {
                  fontSize: 13, fontWeight: hasActive ? 600 : 500, lineHeight: 1.4,
                  color: hasActive ? T.textActive : T.textNav,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                },
              },
            }}
          />
          <ChevronRightIcon sx={{
            fontSize: 15, color: hasActive ? T.iconActive : T.iconIdle,
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease', flexShrink: 0, ml: 0.5,
          }} />
        </>
      )}
    </ListItemButton>
  );
  return mini ? <Tooltip title={label} placement="right" arrow>{button}</Tooltip> : button;
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { open, toggle } = useSidebar();

  const [menuTree, setMenuTree] = useState<MenuNode[] | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Fetch árbol del usuario
  useEffect(() => {
    fetch('/api/menus')
      .then(r => r.json())
      .then(json => setMenuTree((json.data ?? []) as MenuNode[]))
      .catch(() => setMenuTree([]));
  }, []);

  // Auto-expand sección activa
  useEffect(() => {
    if (!menuTree) return;
    menuTree.forEach(node => {
      if (node.url === null) {
        const hasActive = node.hijos.some(
          h => pathname === h.url || (h.url && h.url !== '/dashboard' && pathname.startsWith(h.url))
        );
        if (hasActive) setExpanded(prev => new Set([...prev, node.id]));
      }
    });
  }, [pathname, menuTree]);

  const toggleSection = (id: number) => {
    if (!open) { toggle(); setExpanded(new Set([id])); return; }
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isActive = (url: string | null) =>
    url !== null && (pathname === url || (url !== '/dashboard' && pathname.startsWith(url)));

  const rolCodigo = session?.user?.roles?.[0] ?? '';
  const rolLabel  = ROL_LABEL[rolCodigo] ?? rolCodigo;
  const rolBadge  = ROL_BADGE[rolCodigo] ?? { bg: 'rgba(149,165,166,0.18)', text: '#95A5A6', border: 'rgba(149,165,166,0.38)' };
  const nombre    = session?.user?.nombre ?? '';
  const username  = session?.user?.username ?? '';
  const initials  = nombre.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || 'U';
  const paperWidth = open ? SIDEBAR_WIDTH : SIDEBAR_MINI;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: paperWidth, flexShrink: 0,
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        '& .MuiDrawer-paper': {
          width: paperWidth, boxSizing: 'border-box', bgcolor: T.bg, borderRight: 'none',
          display: 'flex', flexDirection: 'column', overflowX: 'hidden',
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <Box sx={{
        height: 64, bgcolor: T.header, borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        px: open ? 2 : 0, flexShrink: 0, overflow: 'hidden',
      }}>
        {open ? (
          <Box sx={{ position: 'relative', width: 160, height: 44 }}>
            <Image src="/logo/img/logo-ferreteria.png" alt="Logo" fill style={{ objectFit: 'contain', objectPosition: 'left center' }} priority />
          </Box>
        ) : (
          <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: '#F39C12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 18, lineHeight: 1 }}>F</Typography>
          </Box>
        )}
      </Box>

      {/* ── Navegación ────────────────────────────────────────────────── */}
      <Box sx={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1,
        '&::-webkit-scrollbar':       { width: 3 },
        '&::-webkit-scrollbar-thumb': { bgcolor: T.scroll, borderRadius: 4 },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
      }}>
        {menuTree === null ? (
          <Box sx={{ px: 1.5, pt: 1.5 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={38} sx={{ mb: 0.75, borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.08)' }} />
            ))}
          </Box>
        ) : (
          <List dense disablePadding sx={{ px: 1.25, pt: 0.5 }}>
            {menuTree.map((node, idx) => {
              // Nodo hoja directo (DASHBOARD, etc.)
              if (node.url !== null && node.hijos.length === 0) {
                const active = isActive(node.url);
                if (!open) return (
                  <ListItem key={node.id} disablePadding sx={{ mb: 0.5, display: 'block' }}>
                    <Tooltip title={node.descripcion} placement="right" arrow>
                      <ListItemButton
                        component={NextLink} href={node.url}
                        sx={{
                          borderRadius: '8px', minHeight: 42, px: 0, justifyContent: 'center',
                          color: active ? T.textActive : T.textNav,
                          bgcolor: active ? T.activeBg : 'transparent',
                          '&:hover': { bgcolor: active ? T.activeBg : T.hover },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 0, color: active ? T.iconActive : T.iconIdle, justifyContent: 'center' }}>
                          {(() => { const I = getIcon(node.icono); return <I sx={{ fontSize: 18 }} />; })()}
                        </ListItemIcon>
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                );
                return (
                  <ListItem key={node.id} disablePadding sx={{ mb: 0.5, display: 'block' }}>
                    <NavLeaf label={node.descripcion} href={node.url} iconName={node.icono} active={active} />
                  </ListItem>
                );
              }

              // Sección colapsable con hijos
              if (node.hijos.length > 0) {
                const hasActive = node.hijos.some(h => isActive(h.url));
                const isExpanded = expanded.has(node.id);
                return (
                  <Box key={node.id} sx={{ mb: 0.25 }}>
                    {idx > 0 && open && <Box sx={{ height: '1px', bgcolor: T.divider, mx: 1, mb: 0.5 }} />}
                    <SectionHeader
                      label={node.descripcion}
                      iconName={node.icono}
                      isOpen={isExpanded}
                      hasActive={hasActive}
                      mini={!open}
                      onToggle={() => toggleSection(node.id)}
                    />
                    {open && (
                      <Collapse in={isExpanded} timeout={220} unmountOnExit>
                        <Box sx={{ ml: 2.5, pl: 1, borderLeft: `1px solid ${T.divider}`, mt: 0.25, mb: 0.5 }}>
                          {node.hijos.map(hijo => (
                            <Box key={hijo.id} sx={{ mb: 0.25 }}>
                              <NavLeaf
                                label={hijo.descripcion}
                                href={hijo.url ?? '#'}
                                iconName={hijo.icono}
                                active={isActive(hijo.url)}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Collapse>
                    )}
                  </Box>
                );
              }

              return null;
            })}
          </List>
        )}
      </Box>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <Box sx={{
        borderTop: `1px solid ${T.border}`, bgcolor: T.footer,
        px: open ? 1.75 : 0, py: 1.5, display: 'flex', alignItems: 'center',
        justifyContent: open ? 'flex-start' : 'center', gap: 1.25, flexShrink: 0, overflow: 'hidden',
      }}>
        <Tooltip title={!open ? `${nombre} · ${rolLabel}` : ''} placement="right" arrow>
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#F39C12', fontSize: 12.5, fontWeight: 700, flexShrink: 0, cursor: 'default' }}>
            {initials}
          </Avatar>
        </Tooltip>
        {open && (
          <>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography noWrap sx={{ color: '#FFFFFF', fontSize: 12.5, fontWeight: 600, lineHeight: 1.3 }}>
                {nombre || 'Usuario'}
              </Typography>
              {username && (
                <Typography noWrap sx={{ color: T.section, fontSize: 10.5, lineHeight: 1.4 }}>@{username}</Typography>
              )}
              {rolLabel && (
                <Box component="span" sx={{
                  display: 'inline-flex', alignItems: 'center', mt: 0.4, px: 0.75, py: 0.2,
                  borderRadius: '5px', bgcolor: rolBadge.bg, border: `1px solid ${rolBadge.border}`,
                }}>
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
                sx={{ color: T.section, width: 30, height: 30, flexShrink: 0, '&:hover': { color: '#E74C3C', bgcolor: 'rgba(231,76,60,0.12)' } }}
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
