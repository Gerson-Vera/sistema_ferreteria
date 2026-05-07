import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import InventoryIcon from '@mui/icons-material/Inventory';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PeopleIcon from '@mui/icons-material/People';
import StatCard from '@/shared/components/ui/StatCard';
import PageHeader from '@/shared/components/ui/PageHeader';
import DashboardCharts from '@/shared/components/ui/DashboardCharts';
import db from '@/lib/db';

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

async function getDashboardStats() {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // 7-day window
  const startOf7Days = new Date(startOfToday);
  startOf7Days.setDate(startOf7Days.getDate() - 6);

  const [totalProductos, totalClientes, productosConStock, ventasHoy, ventasSemanaRaw, ventasPorEstadoRaw, productosPorCategoriaRaw] =
    await Promise.all([
      db.producto.count({ where: { estado: true } }),
      db.cliente.count({ where: { estado: true } }),
      db.producto.findMany({
        where: { estado: true },
        select: { stock: true, stockMinimo: true },
      }),
      db.venta.aggregate({
        _sum: { total: true },
        where: { creadoEn: { gte: startOfToday } },
      }),
      db.venta.findMany({
        where: { creadoEn: { gte: startOf7Days } },
        select: { creadoEn: true, total: true },
      }),
      db.venta.groupBy({
        by: ['estado'],
        _count: { id: true },
      }),
      db.producto.groupBy({
        by: ['categoriaId'],
        where: { estado: true },
        _count: { id: true },
      }),
    ]);

  const stockBajo = productosConStock.filter(p => p.stock <= p.stockMinimo).length;
  const totalVentasHoy = Number(ventasHoy._sum.total ?? 0);

  // Build 7-day daily chart data
  const diasMap: Record<string, { total: number; cantidad: number }> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOf7Days);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    diasMap[key] = { total: 0, cantidad: 0 };
  }
  for (const v of ventasSemanaRaw) {
    const key = new Date(v.creadoEn).toISOString().slice(0, 10);
    if (diasMap[key]) {
      diasMap[key].total += Number(v.total);
      diasMap[key].cantidad += 1;
    }
  }
  const ventasSemana = Object.entries(diasMap).map(([date, val]) => {
    const d = new Date(date + 'T12:00:00Z');
    return { dia: DIAS[d.getUTCDay()], total: Math.round(val.total * 100) / 100, cantidad: val.cantidad };
  });

  // Estado data
  const ventasPorEstado = ventasPorEstadoRaw.map(e => ({
    estado: e.estado.charAt(0).toUpperCase() + e.estado.slice(1),
    cantidad: e._count.id,
  }));

  // Category data — fetch category names
  const categoriaIds = productosPorCategoriaRaw.map(r => r.categoriaId).filter((id): id is number => id !== null);
  const categorias = await db.categoria.findMany({
    where: { id: { in: categoriaIds } },
    select: { id: true, codigo: true, descripcion: true },
  });
  const catMap = Object.fromEntries(categorias.map(c => [c.id, c.descripcion ?? c.codigo]));
  const ventasPorCategoria = productosPorCategoriaRaw
    .filter(r => r.categoriaId !== null)
    .map(r => ({ categoria: catMap[r.categoriaId!] ?? 'Sin categoría', cantidad: r._count.id }))
    .sort((a, b) => b.cantidad - a.cantidad);

  return { totalProductos, totalClientes, stockBajo, totalVentasHoy, ventasSemana, ventasPorCategoria, ventasPorEstado };
}

export default async function DashboardPage() {
  const { totalProductos, totalClientes, stockBajo, totalVentasHoy, ventasSemana, ventasPorCategoria, ventasPorEstado } =
    await getDashboardStats();

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Resumen general del sistema" />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Productos"
            value={String(totalProductos)}
            subtitle="en inventario"
            icon={<InventoryIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Ventas Hoy"
            value={`S/ ${totalVentasHoy.toFixed(2)}`}
            subtitle="total del día"
            icon={<PointOfSaleIcon />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Stock Bajo"
            value={String(stockBajo)}
            subtitle="bajo mínimo"
            icon={<WarningAmberIcon />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Clientes"
            value={String(totalClientes)}
            subtitle="registrados"
            icon={<PeopleIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      <DashboardCharts
        ventasSemana={ventasSemana}
        ventasPorCategoria={ventasPorCategoria}
        ventasPorEstado={ventasPorEstado}
      />
    </Box>
  );
}
