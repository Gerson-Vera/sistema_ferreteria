-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "punto_reorden" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stock_maximo" INTEGER NOT NULL DEFAULT 0;
