import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InventoryIcon from '@mui/icons-material/Inventory';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PeopleIcon from '@mui/icons-material/People';
import StatCard from '@/shared/components/ui/StatCard';
import PageHeader from '@/shared/components/ui/PageHeader';

export default function DashboardPage() {
  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Resumen general del sistema" />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Productos"
            value="—"
            subtitle="en inventario"
            icon={<InventoryIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Ventas Hoy"
            value="S/ —"
            subtitle="pendiente DB"
            icon={<PointOfSaleIcon />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Stock Bajo"
            value="—"
            subtitle="bajo mínimo"
            icon={<WarningAmberIcon />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Clientes"
            value="—"
            subtitle="registrados"
            icon={<PeopleIcon />}
            color="info"
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Conectado a <strong>db_fereteria</strong> · PostgreSQL
        </Typography>
      </Box>
    </Box>
  );
}
