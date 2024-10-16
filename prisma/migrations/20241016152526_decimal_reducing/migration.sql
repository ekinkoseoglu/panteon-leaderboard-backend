/*
  Warnings:

  - You are about to alter the column `money` on the `player` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE `player` MODIFY `money` DECIMAL(10, 2) NOT NULL DEFAULT 0;
