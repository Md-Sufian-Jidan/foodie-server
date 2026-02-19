/*
  Warnings:

  - Added the required column `mealId` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "mealId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
