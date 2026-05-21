'use client';
import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LockIcon from '@mui/icons-material/Lock';
import type { RolAdmin, MenuAdmin } from '../types';

type Props = {
  open: boolean;
  rol: RolAdmin | null;
  menus: MenuAdmin[];
  loading: boolean;
  error: string | null;
  onSave: (rolId: string, menuIds: string[]) => void;
  onClose: () => void;
};

function MenuNode({
  menu, checked, indeterminate, onToggle, childrenChecked, allChildren,
}: {
  menu: MenuAdmin;
  checked: boolean;
  indeterminate: boolean;
  onToggle: (id: string) => void;
  childrenChecked: Set<string>;
  allChildren: MenuAdmin[];
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = menu.hijos.length > 0;

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        <FormControlLabel
          sx={{ flex: 1, mr: 0 }}
          control={
            <Checkbox
              size="small"
              checked={checked}
              indeterminate={indeterminate}
              onChange={() => onToggle(menu.id)}
            />
          }
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: hasChildren ? 700 : 400 }}>
                {menu.descripcion}
              </Typography>
              {menu.url && (
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  {menu.url}
                </Typography>
              )}
            </Box>
          }
        />
        {!menu.estado && <Chip label="inactivo" size="small" color="default" sx={{ mr: 1 }} />}
        {hasChildren && (
          <IconButton size="small" onClick={() => setExpanded(v => !v)}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        )}
      </Stack>

      {hasChildren && (
        <Collapse in={expanded}>
          <Box sx={{ pl: 3, borderLeft: '1px solid', borderColor: 'divider', ml: 2.5, mt: 0.25 }}>
            {menu.hijos.map(hijo => {
              const hijosDeHijo = hijo.hijos;
              const isChecked    = childrenChecked.has(hijo.id);
              const someHijo     = hijosDeHijo.some(h => childrenChecked.has(h.id));
              const isIndeterminate = !isChecked && someHijo;
              return (
                <MenuNode
                  key={hijo.id}
                  menu={hijo}
                  checked={isChecked}
                  indeterminate={isIndeterminate}
                  onToggle={onToggle}
                  childrenChecked={childrenChecked}
                  allChildren={allChildren}
                />
              );
            })}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

function collectAllIds(menus: MenuAdmin[]): string[] {
  const ids: string[] = [];
  function walk(m: MenuAdmin) { ids.push(m.id); m.hijos.forEach(walk); }
  menus.forEach(walk);
  return ids;
}

export default function RolPermisosDialog({ open, rol, menus, loading, error, onSave, onClose }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && rol) {
      setSelected(new Set(rol.menus.map(m => m.id)));
    }
  }, [open, rol]);

  if (!rol) return null;

  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allIds     = collectAllIds(menus);
  const allChecked = allIds.length > 0 && allIds.every(id => selected.has(id));

  const toggleAll = () =>
    setSelected(allChecked ? new Set() : new Set(allIds));

  const handleSave = () => onSave(rol.id, Array.from(selected));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1.5}>
          <LockIcon color="primary" />
          <Box>
            <Typography variant="h6" component="div">Permisos de menú</Typography>
            <Typography variant="caption" color="text.secondary">Rol: {rol.codigo} — {rol.descripcion}</Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <FormControlLabel
            control={<Checkbox size="small" checked={allChecked} onChange={toggleAll} />}
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Seleccionar todos</Typography>}
          />
          <Chip label={`${selected.size} / ${allIds.length} seleccionados`} size="small" color="primary" variant="outlined" />
        </Stack>

        <Divider sx={{ mb: 1.5 }} />

        {menus.length === 0 ? (
          <Typography color="text.secondary" variant="body2">No hay menús creados aún.</Typography>
        ) : menus.map(menu => {
          const allHijosIds   = collectAllIds(menu.hijos);
          const isChecked     = selected.has(menu.id);
          const someHijo      = allHijosIds.some(id => selected.has(id));
          const isIndeterminate = !isChecked && someHijo;
          return (
            <Box key={menu.id} sx={{ mb: 1 }}>
              <MenuNode
                menu={menu}
                checked={isChecked}
                indeterminate={isIndeterminate}
                onToggle={toggle}
                childrenChecked={selected}
                allChildren={allHijosIds.map(id => ({ id }) as MenuAdmin)}
              />
            </Box>
          );
        })}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar permisos'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
