'use client';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  type PieLabelRenderProps,
} from 'recharts';

type DiaVenta = { dia: string; total: number; cantidad: number };
type CategoriaData = { categoria: string; cantidad: number };
type EstadoData = { estado: string; cantidad: number };

type Props = {
  ventasSemana: DiaVenta[];
  ventasPorCategoria: CategoriaData[];
  ventasPorEstado: EstadoData[];
};

const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#0288d1', '#c62828', '#558b2f', '#6a1b9a'];
const ESTADO_COLORS: Record<string, string> = {
  completada: '#2e7d32',
  pendiente: '#ed6c02',
  anulada: '#c62828',
};

const fmt = (n: number) => `S/ ${n.toFixed(2)}`;

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tooltipFmt(value: any, name: any): [string, string] {
  if (name === 'total') return [fmt(Number(value)), 'Total'];
  return [String(value), name === 'cantidad' ? 'Ventas' : String(name)];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function simpleFmt(value: any): [string, string] {
  return [String(value), 'Cantidad'];
}

function renderPieLabel(props: PieLabelRenderProps & { estado?: string }) {
  const { estado, percent } = props;
  if (!estado || percent === undefined) return null;
  return `${estado} ${((percent as number) * 100).toFixed(0)}%`;
}

export default function DashboardCharts({ ventasSemana, ventasPorCategoria, ventasPorEstado }: Props) {
  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      {/* Ventas últimos 7 días */}
      <Grid size={{ xs: 12, md: 8 }}>
        <ChartCard title="Ventas — últimos 7 días">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ventasSemana} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={n => `S/${n}`} width={60} />
              <Tooltip formatter={tooltipFmt} />
              <Bar dataKey="total" fill="#1976d2" radius={[4, 4, 0, 0]} name="total" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* Ventas por estado */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ChartCard title="Ventas por estado">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={ventasPorEstado}
                dataKey="cantidad"
                nameKey="estado"
                cx="50%"
                cy="45%"
                outerRadius={85}
                label={renderPieLabel}
                labelLine={false}
              >
                {ventasPorEstado.map((entry, i) => (
                  <Cell key={i} fill={ESTADO_COLORS[entry.estado.toLowerCase()] ?? COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={simpleFmt} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* Productos por categoría */}
      <Grid size={{ xs: 12 }}>
        <ChartCard title="Productos por categoría">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={ventasPorCategoria}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="categoria" type="category" tick={{ fontSize: 11 }} width={110} />
              <Tooltip formatter={simpleFmt} />
              <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                {ventasPorCategoria.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>
    </Grid>
  );
}
