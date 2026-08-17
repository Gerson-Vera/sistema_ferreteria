-- AlterTable
ALTER TABLE "compra_items" ADD COLUMN     "factor_unidad" DECIMAL(10,2) NOT NULL DEFAULT 1,
ADD COLUMN     "unidad_medida_id" INTEGER;

-- AlterTable
ALTER TABLE "proveedores" ADD COLUMN     "lead_time_dias" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "stock_almacenes" ADD COLUMN     "stock_reservado" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "venta_items" ADD COLUMN     "factor_unidad" DECIMAL(10,2) NOT NULL DEFAULT 1,
ADD COLUMN     "unidad_medida_id" INTEGER;

-- CreateTable
CREATE TABLE "producto_unidad_conversiones" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "unidad_medida_id" INTEGER NOT NULL,
    "factor" DECIMAL(10,2) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producto_unidad_conversiones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "producto_unidad_conversiones_producto_id_unidad_medida_id_key" ON "producto_unidad_conversiones"("producto_id", "unidad_medida_id");

-- AddForeignKey
ALTER TABLE "producto_unidad_conversiones" ADD CONSTRAINT "producto_unidad_conversiones_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_unidad_conversiones" ADD CONSTRAINT "producto_unidad_conversiones_unidad_medida_id_fkey" FOREIGN KEY ("unidad_medida_id") REFERENCES "unidades_medida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta_items" ADD CONSTRAINT "venta_items_unidad_medida_id_fkey" FOREIGN KEY ("unidad_medida_id") REFERENCES "unidades_medida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_items" ADD CONSTRAINT "compra_items_unidad_medida_id_fkey" FOREIGN KEY ("unidad_medida_id") REFERENCES "unidades_medida"("id") ON DELETE SET NULL ON UPDATE CASCADE;
