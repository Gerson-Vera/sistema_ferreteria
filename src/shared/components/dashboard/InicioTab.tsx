'use client';
import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { MODULOS, type ModuloInfo } from '@/lib/dashboard/roleConfig';
import { getIcon } from './icons';

// ─── Shared card style ───────────────────────────────────────────────────────
const card = {
  background: '#FFFFFF',
  border: '1px solid rgba(44,62,80,0.09)',
  borderRadius: '12px',
  boxShadow: '0 2px 10px rgba(44,62,80,0.05)',
} as const;

// ─── Module card ─────────────────────────────────────────────────────────────
function ModuleCard({ modulo }: { modulo: ModuloInfo }) {
  const Icon = getIcon(modulo.icon);
  return (
    <Box
      component={NextLink}
      href={modulo.href}
      sx={{
        ...card,
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        textDecoration: 'none',
        transition: 'all 0.22s ease',
        '&:hover': {
          boxShadow: `0 8px 24px rgba(243,156,18,0.14)`,
          border: `1px solid rgba(243,156,18,0.35)`,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: '10px',
          bgcolor: `${modulo.color}18`,
          border: `1px solid ${modulo.color}35`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon style={{ width: 22, height: 22, color: modulo.color }} />
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily: 'var(--font-barlow, "Barlow Condensed", Geist, sans-serif)',
            fontSize: 16,
            fontWeight: 700,
            color: '#2C3E50',
            mb: 0.35,
            letterSpacing: '0.01em',
          }}
        >
          {modulo.nombre}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: '#95A5A6', lineHeight: 1.5 }}>
          {modulo.descripcion}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Section heading ─────────────────────────────────────────────────────────
function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography
        sx={{
          fontFamily: 'var(--font-barlow, "Barlow Condensed", Geist, sans-serif)',
          fontSize: { xs: 20, md: 26 },
          fontWeight: 700,
          color: '#2C3E50',
          letterSpacing: '0.01em',
          mb: 0.4,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: 13.5, color: '#95A5A6' }}>{subtitle}</Typography>
      )}
    </Box>
  );
}

// ─── InicioTab ───────────────────────────────────────────────────────────────
export default function InicioTab() {
  return (
    <Box>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 240, md: 320 },
          display: 'flex',
          alignItems: 'center',
          backgroundImage: `linear-gradient(135deg, rgba(44,62,80,0.90) 0%, rgba(36,51,66,0.85) 60%, rgba(27,46,60,0.95) 100%), url('/logo/img/wallpaper.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden',
          px: { xs: 3, md: 8 },
          py: 5,
        }}
      >
        {/* Subtle geometric accents */}
        <Box sx={{
          position: 'absolute', top: -60, right: -60,
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(243,156,18,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -80, left: '40%',
          width: 240, height: 240, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(149,165,166,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 640 }}>
          {/* Status pill */}
          <Box
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.75,
              px: 1.25, py: 0.5,
              borderRadius: '6px',
              bgcolor: 'rgba(243,156,18,0.15)',
              border: '1px solid rgba(243,156,18,0.3)',
              mb: 2,
            }}
          >
            <Box sx={{
              width: 6, height: 6, borderRadius: '50%', bgcolor: '#F39C12',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.35 } },
            }} />
            <Typography sx={{ fontSize: 11, color: '#F39C12', fontWeight: 600, fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
              Sistema activo
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: 'var(--font-barlow, "Barlow Condensed", Geist, sans-serif)',
              fontSize: { xs: 40, md: 58 },
              fontWeight: 800,
              color: '#ECF0F1',
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              mb: 1.5,
            }}
          >
            Inversiones
            <Box component="span" sx={{ color: '#F39C12', display: 'block' }}>Andrew Valentino</Box>
          </Typography>

          <Typography sx={{ fontSize: { xs: 14, md: 16 }, color: 'rgba(236,240,241,0.7)', lineHeight: 1.6, maxWidth: 480 }}>
            Tu ferretería de confianza desde 2005. Sistema de gestión integral para
            inventario, ventas, compras y más.
          </Typography>
        </Box>
      </Box>

      {/* ── Historia ──────────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 3, md: 5 }, py: 4, bgcolor: '#ECF0F1' }}>
        <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <SectionHeading title="Nuestra historia" />
            <Box sx={{ ...card, p: 3 }}>
              <Typography sx={{ fontSize: 13.5, color: '#2C3E50', lineHeight: 1.75, mb: 2 }}>
                Inversiones Andrew Valentino E.I.R.L. fue fundada en 2005 con el propósito de ofrecer a la
                comunidad productos de construcción, herramientas industriales y ferretería
                en general, con el más alto nivel de atención al cliente y calidad garantizada.
                A lo largo de los años hemos crecido hasta convertirnos en un referente
                confiable del sector.
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#95A5A6', mb: 0.25, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Misión
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: '#2C3E50', lineHeight: 1.6, maxWidth: 280 }}>
                    Proveer soluciones en ferretería y materiales de construcción de alta
                    calidad, con disponibilidad, precios competitivos y servicio excepcional.
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#95A5A6', mb: 0.25, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Visión
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: '#2C3E50', lineHeight: 1.6, maxWidth: 280 }}>
                    Ser la ferretería líder de la región, reconocida por innovación,
                    confianza y compromiso permanente con nuestros clientes.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Stats */}
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionHeading title="En números" />
            <Grid container spacing={1.5}>
              {[
                { value: '19+', label: 'Años de experiencia' },
                { value: '5K+', label: 'Clientes atendidos'  },
                { value: '8K+', label: 'Productos en stock'  },
                { value: '99%', label: 'Clientes satisfechos'},
              ].map(s => (
                <Grid key={s.label} size={{ xs: 6 }}>
                  <Box sx={{ ...card, p: 2, textAlign: 'center' }}>
                    <Typography
                      sx={{
                        fontFamily: 'var(--font-barlow, Geist, sans-serif)',
                        fontSize: 28, fontWeight: 800,
                        color: '#F39C12', lineHeight: 1,
                      }}
                    >
                      {s.value}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: '#95A5A6', mt: 0.5, lineHeight: 1.3 }}>
                      {s.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* ── Módulos ───────────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pb: 5, bgcolor: '#ECF0F1' }}>
        <SectionHeading
          title="¿Qué contiene el sistema?"
          subtitle="Módulos disponibles en la plataforma"
        />
        <Grid container spacing={2}>
          {MODULOS.map(m => (
            <Grid key={m.nombre} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ModuleCard modulo={m} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
