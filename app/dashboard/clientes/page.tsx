import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/shared/components/ui/PageHeader';

export default function ClientesPage() {
  return (
    <PageHeader
      title="Clientes"
      subtitle="Gestión de clientes"
      action={
        <Button variant="contained" startIcon={<AddIcon />}>
          Nuevo Cliente
        </Button>
      }
    />
  );
}
