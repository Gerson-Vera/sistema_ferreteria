'use client';
import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InventoryIcon from '@mui/icons-material/Inventory';
import type { Compra, RecibirCompraItemDto } from '../types';

type Props = {
  compra: Compra | null;
  open: boolean;
  mode: 'ver' | 'recibir';
  loading?: boolean;
  onConfirm?: (compraId: string, items: RecibirCompraItemDto[]) => void;
  onClose: () => void;
};

const fmt = (n: number) => `S/ ${n.toFixed(2)}`;

export default function CompraRecibirDialog({ compra, open, mode, loading, onConfirm, onClose }: Props) {
  // Cantidad a recibir ahora, por ítem (en la unidad del documento)
  const [cantidades, setCantidades] = useState<Record<string, number>>({});

  useEffect(() => {
    if (compra && mode === 'recibir') {
      // por defecto se recibe todo lo pendiente
      const init: Record<string, number> = {};
      for (const i of compra.items) init[i.id] = i.cantidad - i.cantidadRecibida;
      setCantidades(init);
    }
  }, [compra, mode]);

  if (!compra) return null;

  const setCantidad = (id: string, max: number, value: string) => {
    const n = Math.max(0, Math.min(max, Math.floor(Number(value) || 0)));
    setCantidades(prev => ({ ...prev, [id]: n }));
  };

  const totalPendiente = compra.items.reduce((s, i) => s + (i.cantidad - i.cantidadRecibida), 0);
  const totalARecibir = compra.items.reduce((s, i) => s + (cantidades[i.id] ?? 0), 0);
  const quedaraPendiente = totalPendiente - totalARecibir;

  const handleConfirm = () =>
    onConfirm?.(
      compra.id,
      compra.items
        .filter(i => (cantidades[i.id] ?? 0) > 0)
        .map(i => ({ itemId: i.id, cantidad: cantidades[i.id] })),
    );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <InventoryIcon color={mode === 'recibir' ? 'success' : 'primary'} />
          <Box>
            <Typography variant="h6" component="div">
              {mode === 'recibir' ? 'Registrar recepción' : 'Detalle de compra'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {compra.numero} · {compra.proveedorNombre}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {mode === 'recibir' && (
          <Alert severity={quedaraPendiente > 0 ? 'warning' : 'info'} sx={{ mb: 2 }}>
            {quedaraPendiente > 0
              ? `Recepción parcial: quedarán ${quedaraPendiente} unidad(es) pendientes por recibir (backorder).`
              : 'Indique las cantidades que llegaron con el proveedor. Puede recibir menos y completar después.'}
          </Alert>
        )}

        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell>Producto</TableCell>
              <TableCell align="center">Pedido</TableCell>
              <TableCell align="center">Recibido</TableCell>
              <TableCell align="center">Pendiente</TableCell>
              {mode === 'recibir' && <TableCell align="center">Recibir ahora</TableCell>}
              <TableCell align="right">Costo Unit.</TableCell>
              <TableCell align="right">Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {compra.items.map(item => {
              const pendiente = item.cantidad - item.cantidadRecibida;
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.descripcion}
                    </Typography>
                    {item.unidadCodigo && item.factorUnidad !== 1 && (
                      <Typography variant="caption" color="text.secondary">
                        {item.unidadCodigo} (×{item.factorUnidad})
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{item.cantidad}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={item.cantidadRecibida}
                      size="small"
                      color={item.cantidadRecibida >= item.cantidad ? 'success' : 'default'}
                      variant={item.cantidadRecibida > 0 ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      color={pendiente > 0 ? 'warning.main' : 'text.secondary'}
                      sx={{ fontWeight: pendiente > 0 ? 600 : 400 }}
                    >
                      {pendiente}
                    </Typography>
                  </TableCell>
                  {mode === 'recibir' && (
                    <TableCell align="center">
                      {pendiente > 0 ? (
                        <TextField
                          type="number"
                          size="small"
                          value={cantidades[item.id] ?? 0}
                          onChange={e => setCantidad(item.id, pendiente, e.target.value)}
                          slotProps={{ htmlInput: { min: 0, max: pendiente, style: { textAlign: 'center' } } }}
                          sx={{ width: 90 }}
                        />
                      ) : (
                        <Chip label="Completo" size="small" color="success" variant="outlined" />
                      )}
                    </TableCell>
                  )}
                  <TableCell align="right">
                    <Typography variant="body2">{fmt(item.costoUnitario)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmt(item.subtotal)}</Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={3} sx={{ justifyContent: 'flex-end' }}>
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
            disabled={loading || totalARecibir === 0}
          >
            {loading
              ? 'Registrando...'
              : `Recibir ${totalARecibir} de ${totalPendiente} pendiente(s)`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
