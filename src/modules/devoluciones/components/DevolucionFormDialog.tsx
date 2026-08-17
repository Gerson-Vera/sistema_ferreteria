'use client';
import { useState, useEffect, useMemo } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ventasClientService } from '@/modules/ventas/services/ventas.client';
import { comprasClientService } from '@/modules/compras/services/compras.client';
import { productosClientService } from '@/modules/productos/services/productos.client';
import { almacenesClientService } from '@/modules/almacenes/services/almacenes.client';
import type { Venta } from '@/modules/ventas/types';
import type { Compra } from '@/modules/compras/types';
import type { Producto } from '@/modules/productos/types';
import type { Almacen } from '@/modules/almacenes/types';
import type { CreateDevolucionDto, TipoDevolucion } from '../types';

type DocOption = {
  id: string;
  numero: string;
  contraparte: string;
  almacenId: string | null;
  items: { productoId: string; cantidad: number; precioUnitario: number }[];
};

type Props = {
  open: boolean;
  tipo: TipoDevolucion;
  onClose: () => void;
  onSubmit: (data: CreateDevolucionDto) => Promise<void>;
  loading: boolean;
};

export default function DevolucionFormDialog({ open, tipo, onClose, onSubmit, loading }: Props) {
  const [documentos, setDocumentos] = useState<DocOption[]>([]);
  const [docSeleccionado, setDocSeleccionado] = useState<DocOption | null>(null);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [almacenId, setAlmacenId] = useState('');
  const [productosMap, setProductosMap] = useState<Record<string, Producto>>({});
  const [cantidades, setCantidades] = useState<Record<string, string>>({});
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    almacenesClientService.getAll(true).then(a => {
      setAlmacenes(a);
      if (a.length > 0) setAlmacenId(prev => prev || a[0].id);
    }).catch(() => {});
    productosClientService.getAll({ limit: 500 }).then(r => {
      const map: Record<string, Producto> = {};
      for (const p of r.data) map[p.id] = p;
      setProductosMap(map);
    }).catch(() => {});

    if (tipo === 'venta') {
      ventasClientService.getAll({ limit: 100 }).then(r => {
        setDocumentos(r.data
          .filter((v: Venta) => v.estado !== 'anulada')
          .map((v: Venta) => ({
            id: v.id,
            numero: v.numero,
            contraparte: v.clienteNombre,
            almacenId: v.almacenId,
            items: v.items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad, precioUnitario: i.precioUnitario })),
          })));
      }).catch(() => {});
    } else {
      comprasClientService.getAll({ limit: 100, estado: 'recibida' }).then(r => {
        setDocumentos(r.data.map((c: Compra) => ({
          id: c.id,
          numero: c.numero,
          contraparte: c.proveedorNombre,
          almacenId: c.almacenId,
          items: c.items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad, precioUnitario: i.costoUnitario })),
        })));
      }).catch(() => {});
    }
  }, [open, tipo]);

  const handleClose = () => {
    setDocSeleccionado(null);
    setCantidades({});
    setMotivo('');
    setObservaciones('');
    setError(null);
    onClose();
  };

  const seleccionarDoc = (doc: DocOption | null) => {
    setDocSeleccionado(doc);
    setCantidades({});
    if (doc?.almacenId) setAlmacenId(doc.almacenId);
  };

  const nombreDe = (productoId: string) => productosMap[productoId]?.nombre ?? `Producto ${productoId}`;

  const totalDevolucion = useMemo(() => {
    if (!docSeleccionado) return 0;
    return docSeleccionado.items.reduce((s, item) => {
      const c = Number(cantidades[item.productoId] || 0);
      return s + (isNaN(c) ? 0 : c * item.precioUnitario);
    }, 0);
  }, [docSeleccionado, cantidades]);

  const handleSubmit = async () => {
    setError(null);
    if (!docSeleccionado) { setError(`Selecciona la ${tipo} original`); return; }
    if (!almacenId) { setError('Selecciona un almacén'); return; }
    if (motivo.trim().length < 3) { setError('Indica el motivo de la devolución'); return; }

    const items = docSeleccionado.items
      .map(item => ({ productoId: item.productoId, cantidad: Number(cantidades[item.productoId] || 0) }))
      .filter(i => i.cantidad > 0);

    if (items.length === 0) { setError('Indica la cantidad a devolver de al menos un producto'); return; }
    for (const i of items) {
      const original = docSeleccionado.items.find(d => d.productoId === i.productoId)!;
      if (i.cantidad > original.cantidad) {
        setError(`La cantidad de "${nombreDe(i.productoId)}" excede lo ${tipo === 'venta' ? 'vendido' : 'comprado'} (${original.cantidad})`);
        return;
      }
    }

    await onSubmit({
      tipo,
      referenciaId: docSeleccionado.id,
      almacenId,
      motivo: motivo.trim(),
      observaciones: observaciones.trim() || undefined,
      items,
    });
    handleClose();
  };

  const fmt = (n: number) => n.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {tipo === 'venta' ? 'Devolución de Cliente (venta)' : 'Devolución a Proveedor (compra)'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Typography variant="body2" color="error.main">{error}</Typography>}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Autocomplete
              options={documentos}
              getOptionLabel={d => `${d.numero} — ${d.contraparte}`}
              value={docSeleccionado}
              onChange={(_, val) => seleccionarDoc(val)}
              size="small"
              sx={{ flex: 1 }}
              renderInput={params => (
                <TextField {...params} label={tipo === 'venta' ? 'Venta original' : 'Compra original'} />
              )}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>{tipo === 'venta' ? 'Almacén de reingreso' : 'Almacén de salida'}</InputLabel>
              <Select
                value={almacenId}
                label={tipo === 'venta' ? 'Almacén de reingreso' : 'Almacén de salida'}
                onChange={e => setAlmacenId(e.target.value)}
                disabled={loading}
              >
                {almacenes.map(a => (
                  <MenuItem key={a.id} value={a.id}>{a.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <TextField
            label="Motivo"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            fullWidth
            size="small"
            disabled={loading}
            placeholder={tipo === 'venta' ? 'Producto defectuoso, cliente cambió de opinión…' : 'Mercadería dañada, pedido incorrecto…'}
          />
          <TextField
            label="Observaciones"
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={2}
            disabled={loading}
          />

          {docSeleccionado && (
            <>
              <Divider />
              <Typography variant="subtitle2">Productos del documento — indica la cantidad a devolver</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="center">{tipo === 'venta' ? 'Vendido' : 'Comprado'}</TableCell>
                    <TableCell align="right">{tipo === 'venta' ? 'Precio' : 'Costo'}</TableCell>
                    <TableCell align="center" sx={{ width: 130 }}>Devolver</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {docSeleccionado.items.map(item => (
                    <TableRow key={item.productoId}>
                      <TableCell>
                        <Typography variant="body2">{nombreDe(item.productoId)}</Typography>
                      </TableCell>
                      <TableCell align="center">{item.cantidad}</TableCell>
                      <TableCell align="right">{fmt(item.precioUnitario)}</TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          size="small"
                          value={cantidades[item.productoId] ?? ''}
                          onChange={e => setCantidades(prev => ({ ...prev, [item.productoId]: e.target.value }))}
                          sx={{ width: 100 }}
                          slotProps={{ htmlInput: { min: 0, max: item.cantidad, style: { textAlign: 'center' } } }}
                          disabled={loading}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="subtitle2">
                  Total a devolver: {fmt(Math.round(totalDevolucion * 100) / 100)}
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !docSeleccionado}>
          {loading ? 'Guardando…' : 'Registrar Devolución'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
