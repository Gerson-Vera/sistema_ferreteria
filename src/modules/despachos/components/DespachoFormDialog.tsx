'use client';
import { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ventasClientService } from '@/modules/ventas/services/ventas.client';
import { clientesClientService } from '@/modules/clientes/services/clientes.client';
import type { Venta } from '@/modules/ventas/types';
import type { Cliente } from '@/modules/clientes/types';
import type { CreateDespachoDto } from '../types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDespachoDto) => Promise<void>;
  loading: boolean;
};

export default function DespachoFormDialog({ open, onClose, onSubmit, loading }: Props) {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);
  const [direccion, setDireccion] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [transportista, setTransportista] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    ventasClientService.getAll({ limit: 100 })
      .then(r => setVentas(r.data.filter((v: Venta) => v.estado !== 'anulada')))
      .catch(() => {});
    clientesClientService.getAll({ limit: 200 }).then(r => setClientes(r.data)).catch(() => {});
  }, [open]);

  const handleClose = () => {
    setVentaSeleccionada(null);
    setDireccion('');
    setContacto('');
    setTelefono('');
    setTransportista('');
    setObservaciones('');
    setError(null);
    onClose();
  };

  const seleccionarVenta = (venta: Venta | null) => {
    setVentaSeleccionada(venta);
    if (venta) {
      const cliente = clientes.find(c => c.id === venta.clienteId);
      if (cliente) {
        setDireccion(prev => prev || cliente.direccion || '');
        setContacto(prev => prev || cliente.nombre);
        setTelefono(prev => prev || cliente.telefono || '');
      }
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!ventaSeleccionada) { setError('Selecciona la venta a despachar'); return; }
    if (direccion.trim().length < 5) { setError('Indica la dirección de entrega'); return; }

    await onSubmit({
      ventaId: ventaSeleccionada.id,
      direccionEntrega: direccion.trim(),
      contacto: contacto.trim() || undefined,
      telefono: telefono.trim() || undefined,
      transportista: transportista.trim() || undefined,
      observaciones: observaciones.trim() || undefined,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nuevo Despacho</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Typography variant="body2" color="error.main">{error}</Typography>}

          <Autocomplete
            options={ventas}
            getOptionLabel={v => `${v.numero} — ${v.clienteNombre}`}
            value={ventaSeleccionada}
            onChange={(_, val) => seleccionarVenta(val)}
            size="small"
            renderOption={(props, v) => (
              <Box component="li" {...props} key={v.id}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{v.numero}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {v.clienteNombre} · {v.items.length} items · S/ {v.total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={params => <TextField {...params} label="Venta a despachar" />}
          />

          <TextField
            label="Dirección de entrega"
            value={direccion}
            onChange={e => setDireccion(e.target.value)}
            fullWidth
            size="small"
            disabled={loading}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Persona de contacto"
              value={contacto}
              onChange={e => setContacto(e.target.value)}
              fullWidth
              size="small"
              disabled={loading}
            />
            <TextField
              label="Teléfono"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              fullWidth
              size="small"
              disabled={loading}
            />
          </Stack>
          <TextField
            label="Transportista / vehículo"
            value={transportista}
            onChange={e => setTransportista(e.target.value)}
            fullWidth
            size="small"
            disabled={loading}
            placeholder="Nombre del transportista, placa, empresa de courier…"
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
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !ventaSeleccionada}>
          {loading ? 'Guardando…' : 'Crear Despacho'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
