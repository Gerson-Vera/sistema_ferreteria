import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/shared/components/ui/PageHeader';

export default function ProveedoresPage() {
  return (
    <PageHeader
      title="Proveedores"
      subtitle="Gestión de proveedores"
      action={
        <Button variant="contained" startIcon={<AddIcon />}>
          Nuevo Proveedor
        </Button>
      }
    />
  );
}
