'use client';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { getKPIsForRol, getChartForRol, type KPIDefinition, type ChartDefinition } from '@/lib/dashboard/roleConfig';
import { getIcon } from './icons';

// ─── Shared card style ───────────────────────────────────────────────────────
const card = {
  background: '#FFFFFF',
  border: '1px solid rgba(44,62,80,0.09)',
  borderRadius: '12px',
  boxShadow: '0 2px 10px rgba(44,62,80,0.05)',
} as const;

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ kpi }: { kpi: KPIDefinition }) {
  const Icon = getIcon(kpi.icon);
  const isUp   = kpi.mockTrend === 'up';
  const isDown = kpi.mockTrend === 'down';
  const TrendIcon = isUp ? ArrowTrendingUpIcon : isDown ? ArrowTrendingDownIcon : null;
  const trendColor = isUp ? '#27AE60' : isDown ? '#E74C3C' : '#95A5A6';

  return (
    <Box
      sx={{
        ...card,
        p: 2.5,
        transition: 'all 0.24s ease',
        '&:hover': {
          border: `1px solid ${kpi.color}44`,
          transform: 'translateY(-3px)',
          boxShadow: `0 8px 28px ${kpi.color}18`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '10px',
            bgcolor: kpi.bgColor,
            border: `1px solid ${kpi.color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon style={{ width: 22, height: 22, color: kpi.color }} />
        </Box>
        {TrendIcon && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, px: 1, py: 0.4, borderRadius: '6px', bgcolor: `${trendColor}18` }}>
            <TrendIcon style={{ width: 13, height: 13, color: trendColor }} />
            <Typography sx={{ fontSize: 11, color: trendColor, fontWeight: 600, fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
              {kpi.mockChange}
            </Typography>
          </Box>
        )}
        {!TrendIcon && (
          <Typography sx={{ fontSize: 11, color: '#95A5A6', fontFamily: 'var(--font-jetbrains-mono, monospace)' }}>
            {kpi.mockChange}
          </Typography>
        )}
      </Box>

      <Typography
        sx={{
          fontFamily: 'var(--font-barlow, Geist, sans-serif)',
          fontSize: 30,
          fontWeight: 700,
          color: '#2C3E50',
          lineHeight: 1,
          mb: 0.5,
          letterSpacing: '-0.01em',
        }}
      >
        {kpi.mockValue}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: '#95A5A6', fontWeight: 500 }}>
        {kpi.label}
      </Typography>
    </Box>
  );
}

// ─── KPI Skeleton ─────────────────────────────────────────────────────────────
function KPISkeleton() {
  return (
    <Box sx={{ ...card, p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Skeleton variant="rounded" width={44} height={44} sx={{ bgcolor: 'rgba(44,62,80,0.08)', borderRadius: '10px' }} />
        <Skeleton variant="rounded" width={70} height={24} sx={{ bgcolor: 'rgba(44,62,80,0.06)', borderRadius: '6px' }} />
      </Box>
      <Skeleton variant="text" width="55%" height={38} sx={{ bgcolor: 'rgba(44,62,80,0.07)', mb: 0.5 }} />
      <Skeleton variant="text" width="70%" height={20} sx={{ bgcolor: 'rgba(44,62,80,0.05)' }} />
    </Box>
  );
}

// ─── Chart ────────────────────────────────────────────────────────────────────
function DashChart({ chart }: { chart: ChartDefinition }) {
  return (
    <Box sx={{ ...card, p: 3, mt: 3 }}>
      <Typography
        sx={{
          fontFamily: 'var(--font-barlow, Geist, sans-serif)',
          fontSize: 18,
          fontWeight: 700,
          color: '#2C3E50',
          mb: 0.4,
        }}
      >
        {chart.titulo}
      </Typography>
      <Typography sx={{ fontSize: 12, color: '#95A5A6', mb: 2.5 }}>
        {chart.subtitulo}
      </Typography>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chart.data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,62,80,0.07)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#95A5A6', fontSize: 12, fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#95A5A6', fontSize: 12, fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#2C3E50',
              border: '1px solid rgba(44,62,80,0.2)',
              borderRadius: '10px',
              color: '#ECF0F1',
              fontSize: 13,
              boxShadow: '0 8px 32px rgba(44,62,80,0.2)',
            }}
            cursor={{ fill: 'rgba(44,62,80,0.04)' }}
          />
          <Bar dataKey="valor" fill={chart.color} radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

// ─── PanelControl ─────────────────────────────────────────────────────────────
export default function PanelControl({ rol }: { rol: string }) {
  const [loading, setLoading] = useState(true);
  const kpis  = getKPIsForRol(rol);
  const chart = getChartForRol(rol);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, [rol]);

  return (
    <Box sx={{ px: { xs: 3, md: 5 }, py: 4, bgcolor: '#ECF0F1' }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontFamily: 'var(--font-barlow, Geist, sans-serif)',
            fontSize: { xs: 22, md: 28 },
            fontWeight: 700,
            color: '#2C3E50',
            mb: 0.5,
          }}
        >
          Panel de Control
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: '#95A5A6' }}>
          Métricas en tiempo real para tu área de trabajo
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {loading
          ? Array.from({ length: kpis.length || 4 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <KPISkeleton />
              </Grid>
            ))
          : kpis.map(kpi => (
              <Grid key={kpi.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <KPICard kpi={kpi} />
              </Grid>
            ))
        }
      </Grid>

      {!loading && chart && <DashChart chart={chart} />}
    </Box>
  );
}
