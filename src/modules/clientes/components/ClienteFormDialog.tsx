'use client';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import type { Cliente, CreateClienteDto, TipoCliente, TipoDocumento } from '../types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClienteDto) => Promise<void>;
  initialData?: Cliente | null;
  loading?: boolean;
};

const docOptions: Record<TipoCliente, { value: TipoDocumento; label: string }[]> = {
  natural: [
    { value: 'DNI', label: 'DNI' },
    { value: 'CE', label: 'Carné de Extranjería' },
    { value: 'Carnet_Extranjeria', label: 'Carnet Extranjería' },
  ],
  juridica: [
    { value: 'RUC', label: 'RUC' },
  ],
};

type Errors = { nombre?: string; numeroDocumento?: string; tipo?: string; tipoDocumento?: string };

export default function ClienteFormDialog({ open, onClose, onSubmit, initialData, loading }: Props) {
  const [tipo, setTipo] = useState<TipoCliente>('natural');
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>('DNI');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (open) {
      setTipo(initialData?.tipo ?? 'natural');
      setTipoDocumento(initialData?.tipoDocumento ?? 'DNI');
      setNumeroDocumento(initialData?.numeroDocumento ?? '');
      setNombre(initialData?.nombre ?? '');
      setEmail(initialData?.email ?? '');
      setTelefono(initialData?.telefono ?? '');
      setDireccion(initialData?.direccion ?? '');
      setErrors({});
    }
  }, [open, initialData]);

  const handleTipoChange = (val: TipoCliente) => {
    setTipo(val);
    setTipoDocumento(val === 'juridica' ? 'RUC' : 'DNI');
    setNumeroDocumento('');
  };

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!nombre.trim()) errs.nombre = 'El nombre es requerido';
    if (!numeroDocumento.trim()) errs.numeroDocumento = 'El número de documento es requerido';
    else if (tipoDocumento === 'DNI' && !/^\d{8}$/.test(numeroDocumento))
      errs.numeroDocumento = 'El DNI debe tener 8 dígitos';
    else if (tipoDocumento === 'RUC' && !/^\d{11}$/.test(numeroDocumento))
      errs.numeroDocumento = 'El RUC debe tener 11 dígitos';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit({
      tipo,
      tipoDocumento,
      numeroDocumento: numeroDocumento.trim(),
      nombre: nombre.trim(),
      email: email.trim() || undefined,
      telefono: telefono.trim() || undefined,
      direccion: direccion.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{initialData ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
      <DialogContent sx={{ pt: '16px !important' }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de persona</InputLabel>
              <Select
                value={tipo}
                label="Tipo de persona"
                onChange={e => handleTipoChange(e.target.value as TipoCliente)}
                disabled={loading}
              >
                <MenuItem value="natural">Persona Natural</MenuItem>
                <MenuItem value="juridica">Persona Jurídica</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small" error={!!errors.tipoDocumento}>
              <InputLabel>Tipo de documento</InputLabel>
              <Select
                value={tipoDocumento}
                label="Tipo de documento"
                onChange={e => setTipoDocumento(e.target.value as TipoDocumento)}
                disabled={loading}
              >
                {docOptions[tipo].map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
              {errors.tipoDocumento && <FormHelperText>{errors.tipoDocumento}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Nro. de documento"
              required
              fullWidth
              value={numeroDocumento}
              onChange={e => { setNumeroDocumento(e.target.value); setErrors(prev => ({ ...prev, numeroDocumento: undefined })); }}
              error={!!errors.numeroDocumento}
              helperText={errors.numeroDocumento ?? (tipoDocumento === 'DNI' ? '8 dígitos' : tipoDocumento === 'RUC' ? '11 dígitos' : '')}
              disabled={loading}
              slotProps={{ htmlInput: { maxLength: 11 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              label="Nombre / Razón social"
              required
              fullWidth
              autoFocus
              value={nombre}
              onChange={e => { setNombre(e.target.value); setErrors(prev => ({ ...prev, nombre: undefined })); }}
              error={!!errors.nombre}
              helperText={errors.nombre}
              disabled={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Teléfono"
              fullWidth
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Dirección"
              fullWidth
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
              disabled={loading}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
