import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '@/shared/components/ui/PageHeader';

export default function AjustesInventarioPage() {
  return (
    <PageHeader
      title="Ajustes de Inventario"
      subtitle="Conteo físico y corrección de stock"
      action={
        <Button variant="contained" startIcon={<AddIcon />}>
          Nuevo Ajuste
        </Button>
      }
    />
  );
}
