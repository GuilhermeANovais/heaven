/*
  Warnings:

  - You are about to drop the column `stockDelivery` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stockKitchen` on the `Product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Sector" AS ENUM ('KITCHEN', 'DELIVERY', 'BOTH');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "stockDelivery",
DROP COLUMN "stockKitchen",
ADD COLUMN     "sector" "Sector" NOT NULL DEFAULT 'DELIVERY',
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;
