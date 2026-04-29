'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Logo from '@/shared/components/ui/Logo';

type Errors = { username?: string; password?: string };

function validate(username: string, password: string): Errors {
  const errs: Errors = {};
  if (!username.trim()) errs.username = 'El usuario es requerido';
  else if (username.trim().length < 3) errs.username = 'Mínimo 3 caracteres';
  if (!password) errs.password = 'La contraseña es requerida';
  else if (password.length < 4) errs.password = 'Mínimo 4 caracteres';
  return errs;
}

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Errors>({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBlur = (field: 'username' | 'password') => {
    const errs = validate(username, password);
    setFieldErrors(prev => ({ ...prev, [field]: errs[field] }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(username, password);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setAuthError('');
    setLoading(true);
    const result = await signIn('credentials', { username, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setAuthError('Usuario o contraseña incorrectos. Verifica tus datos e intenta nuevamente.');
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Panel izquierdo: formulario ── */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 45%' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 4, sm: 8, md: 10 },
          py: 6,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ maxWidth: 400, width: '100%', mx: 'auto' }}>
          <Box sx={{ mb: 5 }}>
            <Logo width={380} height={164} />
          </Box>

          <Typography variant="h4" fontWeight={700} gutterBottom>
            Bienvenido
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Ingresa tus credenciales para acceder al sistema
          </Typography>

          {authError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setAuthError('')}>
              {authError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <TextField
              label="Usuario"
              name="username"
              fullWidth
              autoFocus
              autoComplete="username"
              value={username}
              onChange={e => { setUsername(e.target.value); setFieldErrors(p => ({ ...p, username: undefined })); }}
              onBlur={() => handleBlur('username')}
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
              disabled={loading}
            />

            <TextField
              label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              autoComplete="current-password"
              value={password}
              onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: undefined })); }}
              onBlur={() => handleBlur('password')}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              disabled={loading}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(v => !v)}
                        edge="end"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{ mt: 1, py: 1.5 }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── Panel derecho: imagen/marca ── */}
      <Box
        sx={{
          flex: '0 0 55%',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, rgba(21,0,0,0.82) 0%, rgba(13,40,61,0.88) 60%, rgba(8,46,110,0.93) 100%), url(/logo/img/wallpaper.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden',
          gap: 4,
          px: 8,
        }}
      >
        {/* Círculos decorativos de fondo */}
        <Box sx={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.08)', top: -120, right: -120,
        }} />
        <Box sx={{
          position: 'absolute', width: 350, height: 350, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)', bottom: -80, left: -60,
        }} />
        <Box sx={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.04)', top: '30%', right: '10%',
        }} />

      

        {/* Texto */}
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          <Typography variant="h5" fontWeight={700} color="white" gutterBottom>
            Sistema de Gestión
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 340 }}>
            Controla tu inventario, ventas y compras desde un solo lugar
          </Typography>
        </Box>

        {/* Puntos decorativos */}
        <Box sx={{ display: 'flex', gap: 1, zIndex: 1 }}>
          {[0, 1, 2].map(i => (
            <Box
              key={i}
              sx={{
                width: 8, height: 8, borderRadius: '50%',
                bgcolor: i === 0 ? 'white' : 'rgba(255,255,255,0.35)',
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
