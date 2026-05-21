'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import AddIcon from '@mui/icons-material/Add';
import type { MenuAdmin } from '../types';

type NodeProps = {
  menu: MenuAdmin;
  depth: number;
  onEditar: (m: MenuAdmin) => void;
  onToggle: (m: MenuAdmin) => void;
  onAgregarHijo: (padre: MenuAdmin) => void;
};

function MenuNode({ menu, depth, onEditar, onToggle, onAgregarHijo }: NodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = menu.hijos.length > 0;

  return (
    <Box>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          pl: depth * 3,
          py: 0.75,
          borderBottom: '1px solid',
          borderColor: 'divider',
          opacity: menu.estado ? 1 : 0.5,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        {hasChildren ? (
          <IconButton size="small" onClick={() => setExpanded(v => !v)} sx={{ mr: 0.5 }}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        ) : (
          <Box sx={{ width: 28, mr: 0.5 }} />
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: depth === 0 ? 700 : 400 }}>
              {menu.descripcion}
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
              {menu.codigo}
            </Typography>
            {!menu.estado && <Chip label="inactivo" size="small" />}
          </Stack>
          {menu.url && (
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {menu.url}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, mr: 1 }}>
          <Chip label={`orden: ${menu.orden}`} size="small" variant="outlined" />
          {menu.icono && <Chip label={menu.icono} size="small" variant="outlined" />}
        </Stack>

        <Tooltip title="Agregar submenú">
          <IconButton size="small" onClick={() => onAgregarHijo(menu)}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton size="small" onClick={() => onEditar(menu)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={menu.estado ? 'Desactivar' : 'Activar'}>
          <IconButton size="small" color={menu.estado ? 'error' : 'success'} onClick={() => onToggle(menu)}>
            {menu.estado ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Stack>

      {hasChildren && (
        <Collapse in={expanded}>
          {menu.hijos.map(hijo => (
            <MenuNode
              key={hijo.id}
              menu={hijo}
              depth={depth + 1}
              onEditar={onEditar}
              onToggle={onToggle}
              onAgregarHijo={onAgregarHijo}
            />
          ))}
        </Collapse>
      )}
    </Box>
  );
}

type Props = {
  tree: MenuAdmin[];
  loading: boolean;
  onEditar: (m: MenuAdmin) => void;
  onToggle: (m: MenuAdmin) => void;
  onAgregarHijo: (padre: MenuAdmin) => void;
};

export default function MenusTree({ tree, loading, onEditar, onToggle, onAgregarHijo }: Props) {
  if (loading) return (
    <Box>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={44} sx={{ mb: 0.5, borderRadius: 1 }} />
      ))}
    </Box>
  );

  if (tree.length === 0) return (
    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
      <Typography color="text.secondary">No hay menús creados. Agrega el primero.</Typography>
    </Paper>
  );

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      {tree.map(menu => (
        <MenuNode
          key={menu.id}
          menu={menu}
          depth={0}
          onEditar={onEditar}
          onToggle={onToggle}
          onAgregarHijo={onAgregarHijo}
        />
      ))}
    </Paper>
  );
}
