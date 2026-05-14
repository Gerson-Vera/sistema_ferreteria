-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "almacen_id" INTEGER;

-- CreateTable
CREATE TABLE "categoria_configs" (
    "id" SERIAL NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "unidad_medida_id" INTEGER,
    "almacen_id" INTEGER,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categoria_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoria_marcas" (
    "categoria_id" INTEGER NOT NULL,
    "marca_id" INTEGER NOT NULL,

    CONSTRAINT "categoria_marcas_pkey" PRIMARY KEY ("categoria_id","marca_id")
);

-- CreateTable
CREATE TABLE "categoria_proveedores" (
    "categoria_id" INTEGER NOT NULL,
    "proveedor_id" INTEGER NOT NULL,

    CONSTRAINT "categoria_proveedores_pkey" PRIMARY KEY ("categoria_id","proveedor_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categoria_configs_categoria_id_key" ON "categoria_configs"("categoria_id");

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "almacenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoria_configs" ADD CONSTRAINT "categoria_configs_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoria_configs" ADD CONSTRAINT "categoria_configs_unidad_medida_id_fkey" FOREIGN KEY ("unidad_medida_id") REFERENCES "unidades_medida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoria_configs" ADD CONSTRAINT "categoria_configs_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "almacenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoria_marcas" ADD CONSTRAINT "categoria_marcas_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoria_marcas" ADD CONSTRAINT "categoria_marcas_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoria_proveedores" ADD CONSTRAINT "categoria_proveedores_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoria_proveedores" ADD CONSTRAINT "categoria_proveedores_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
