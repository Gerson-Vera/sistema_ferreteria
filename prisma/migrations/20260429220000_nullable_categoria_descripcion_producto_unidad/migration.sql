-- AlterTable: categorias.descripcion ahora es opcional
ALTER TABLE "categorias" ALTER COLUMN "descripcion" DROP NOT NULL;

-- AlterTable: productos.unidad_medida_id ahora es opcional
ALTER TABLE "productos" DROP CONSTRAINT "productos_unidad_medida_id_fkey";
ALTER TABLE "productos" ALTER COLUMN "unidad_medida_id" DROP NOT NULL;
ALTER TABLE "productos" ADD CONSTRAINT "productos_unidad_medida_id_fkey" FOREIGN KEY ("unidad_medida_id") REFERENCES "unidades_medida"("id") ON DELETE SET NULL ON UPDATE CASCADE;
