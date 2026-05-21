'use client';
import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type { UsuarioAdmin, RolAdmin } from '../types';

type Props = {
  open: boolean;
  usuario: UsuarioAdmin | null;
  roles: RolAdmin[];
  loading: boolean;
  error: string | null;
  onSave: (data: {
    username?: string; email: string; nombre: string;
    password?: string; roles: string[];
  }) => void;
  onClose: () => void;
};

export default function UsuarioFormDialog({ open, usuario, roles, loading, error, onSave, onClose }: Props) {
  const isEdit = !!usuario;

  const [nombre,    setNombre]    = useState('');
  const [username,  setUsername]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [rolesIds,  setRolesIds]  = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setNombre(usuario?.nombre    ?? '');
      setUsername(usuario?.username ?? '');
      setEmail(usuario?.email      ?? '');
      setPassword('');
      setRolesIds(usuario?.roles.map(r => r.id) ?? []);
      setShowPass(false);
    }
  }, [open, usuario]);

  const toggleRol = (id: string) =>
    setRolesIds(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);

  const handleSave = () => {
    const data: Parameters<typeof onSave>[0] = { email, nombre, roles: rolesIds };
    if (!isEdit) { data.username = username; data.password = password; }
    else if (password) data.password = password;
    onSave(data);
  };

  const canSave = nombre.trim() && email.trim() && (!isEdit ? username.trim() && password.length >= 6 : true);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? `Editar usuario — ${usuario?.username}` : 'Nuevo usuario'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} size="small" required />
          {!isEdit && (
            <TextField
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              size="small"
              required
              helperText="Solo letras, números y guión bajo"
            />
          )}
          <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} size="small" required />
          <TextField
            label={isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            size="small"
            required={!isEdit}
            helperText="Mínimo 6 caracteres"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPass(v => !v)}>
                      {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box>
            <FormLabel component="legend" sx={{ mb: 1, fontSize: 13 }}>Roles</FormLabel>
            <FormGroup>
              {roles.length === 0
                ? <Typography variant="caption" color="text.secondary">No hay roles disponibles</Typography>
                : roles.filter(r => r.estado).map(r => (
                    <FormControlLabel
                      key={r.id}
                      control={
                        <Checkbox
                          size="small"
                          checked={rolesIds.includes(r.id)}
                          onChange={() => toggleRol(r.id)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.codigo}</Typography>
                          <Typography variant="caption" color="text.secondary">{r.descripcion}</Typography>
                        </Box>
                      }
                    />
                  ))
              }
            </FormGroup>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading || !canSave}>
          {loading ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
