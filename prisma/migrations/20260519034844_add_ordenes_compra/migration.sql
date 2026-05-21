-- CreateEnum
CREATE TYPE "EstadoOrden" AS ENUM ('borrador', 'enviada', 'recibida', 'anulada');

-- CreateTable
CREATE TABLE "ordenes_compra" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "proveedor_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "estado" "EstadoOrden" NOT NULL DEFAULT 'borrador',
    "observaciones" TEXT,
    "correo_enviado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_envio" TIMESTAMP(3),
    "fecha_recepcion" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordenes_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_compra_items" (
    "id" SERIAL NOT NULL,
    "orden_compra_id" INTEGER NOT NULL,
    "producto_id" INTEGER,
    "descripcion" TEXT NOT NULL,
    "detalles" TEXT,
    "cantidad" INTEGER NOT NULL,
    "cantidad_recibida" INTEGER NOT NULL DEFAULT 0,
    "costo_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "es_nuevo_producto" BOOLEAN NOT NULL DEFAULT false,
    "precio_venta_sugerido" DECIMAL(10,2),
    "categoria_id" INTEGER,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "orden_compra_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_compra_numero_key" ON "ordenes_compra"("numero");

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_compra_items" ADD CONSTRAINT "orden_compra_items_orden_compra_id_fkey" FOREIGN KEY ("orden_compra_id") REFERENCES "ordenes_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_compra_items" ADD CONSTRAINT "orden_compra_items_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_compra_items" ADD CONSTRAINT "orden_compra_items_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
