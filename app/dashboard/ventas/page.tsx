import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/shared/components/ui/PageHeader';

export default function VentasPage() {
  return (
    <PageHeader
      title="Ventas"
      subtitle="Registro y seguimiento de ventas"
      action={
        <Button variant="contained" startIcon={<AddIcon />}>
          Nueva Venta
        </Button>
      }
    />
  );
}
