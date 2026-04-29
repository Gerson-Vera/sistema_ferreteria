import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/shared/components/ui/PageHeader';

export default function ComprasPage() {
  return (
    <PageHeader
      title="Compras"
      subtitle="Órdenes de compra a proveedores"
      action={
        <Button variant="contained" startIcon={<AddIcon />}>
          Nueva Compra
        </Button>
      }
    />
  );
}
