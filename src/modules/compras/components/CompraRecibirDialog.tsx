'use client';
import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import InventoryIcon from '@mui/icons-material/Inventory';
import type { Compra } from '../types';

type Props = {
  compra: Compra | null;
  open: boolean;
  mode: 'ver' | 'recibir';
  loading?: boolean;
  onConfirm?: (compraId: string, itemsRecibidos: string[]) => void;
  onClose: () => void;
};

const fmt = (n: number) => `S/ ${n.toFixed(2)}`;

export default function CompraRecibirDialog({ compra, open, mode, loading, onConfirm, onClose }: Props) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (compra && mode === 'recibir') {
      // todos marcados por defecto
      setCheckedIds(new Set(compra.items.map(i => i.id)));
    }
  }, [compra, mode]);

  if (!compra) return null;

  const total = compra.items.length;
  const checked = checkedIds.size;
  const allChecked = checked === total;
  const someUnchecked = checked > 0 && checked < total;

  const toggle = (id: string) =>
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setCheckedIds(allChecked ? new Set() : new Set(compra.items.map(i => i.id)));

  const handleConfirm = () => onConfirm?.(compra.id, Array.from(checkedIds));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <InventoryIcon color={mode === 'recibir' ? 'success' : 'primary'} />
          <Box>
            <Typography variant="h6" component="div">
              {mode === 'recibir' ? 'Verificar recepción' : 'Detalle de compra'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {compra.numero} · {compra.proveedorNombre}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {mode === 'recibir' && (
          <Alert
            severity={someUnchecked ? 'warning' : 'info'}
            sx={{ mb: 2 }}
          >
            {someUnchecked
              ? `${total - checked} producto(s) sin marcar no afectarán el stock al confirmar.`
              : 'Marque los productos que efectivamente llegaron con el proveedor.'}
          </Alert>
        )}

        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              {mode === 'recibir' && (
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={allChecked}
                    indeterminate={someUnchecked}
                    onChange={toggleAll}
                  />
                </TableCell>
              )}
              <TableCell>Producto</TableCell>
              <TableCell align="center">Cant.</TableCell>
              <TableCell align="right">Costo Unit.</TableCell>
              <TableCell align="right">Subtotal</TableCell>
              {mode === 'recibir' && <TableCell align="center">Estado</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {compra.items.map(item => {
              const isChecked = checkedIds.has(item.id);
              return (
                <TableRow
                  key={item.id}
                  hover={mode === 'recibir'}
                  onClick={mode === 'recibir' ? () => toggle(item.id) : undefined}
                  sx={{
                    cursor: mode === 'recibir' ? 'pointer' : 'default',
                    opacity: mode === 'recibir' && !isChecked ? 0.45 : 1,
                    transition: 'opacity 0.15s',
                  }}
                >
                  {mode === 'recibir' && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={isChecked}
                        onChange={() => toggle(item.id)}
                        onClick={e => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.descripcion}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{item.cantidad}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">{fmt(item.costoUnitario)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmt(item.subtotal)}</Typography>
                  </TableCell>
                  {mode === 'recibir' && (
                    <TableCell align="center">
                      <Chip
                        label={isChecked ? 'Recibido' : 'No recibido'}
                        color={isChecked ? 'success' : 'default'}
                        size="small"
                        variant={isChecked ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Divider sx={{ my: 2 }} />
        <Stack direction="row" justifyContent="flex-end" spacing={3}>
          <Stack sx={{ alignItems: 'flex-end' }}>
            <Typography variant="caption" color="text.secondary">Subtotal</Typography>
            <Typography variant="body2">{fmt(compra.subtotal)}</Typography>
          </Stack>
          <Stack sx={{ alignItems: 'flex-end' }}>
            <Typography variant="caption" color="text.secondary">IGV (18%)</Typography>
            <Typography variant="body2">{fmt(compra.igv)}</Typography>
          </Stack>
          <Stack sx={{ alignItems: 'flex-end' }}>
            <Typography variant="caption" color="text.secondary">Total</Typography>
            <Typography variant="subtitle2" color="primary">{fmt(compra.total)}</Typography>
          </Stack>
        </Stack>

        {compra.observaciones && (
          <Alert severity="info" sx={{ mt: 2 }} icon={false}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.25 }}>
              Observaciones
            </Typography>
            {compra.observaciones}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {mode === 'recibir' ? 'Cancelar' : 'Cerrar'}
        </Button>
        {mode === 'recibir' && (
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirm}
            disabled={loading || checked === 0}
          >
            {loading
              ? 'Registrando...'
              : `Confirmar recepción (${checked}/${total})`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
