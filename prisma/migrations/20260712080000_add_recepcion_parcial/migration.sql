-- Recepción parcial de compras: estado "parcial" + cantidad recibida por ítem
ALTER TYPE "EstadoCompra" ADD VALUE IF NOT EXISTS 'parcial' BEFORE 'recibida';

ALTER TABLE "compra_items" ADD COLUMN "cantidad_recibida" INTEGER NOT NULL DEFAULT 0;

-- Backfill: las compras ya recibidas ingresaron todo su stock
UPDATE "compra_items" ci
SET "cantidad_recibida" = ci."cantidad"
FROM "compras" c
WHERE ci."compra_id" = c."id" AND c."estado" = 'recibida';
