/*
  Warnings:

  - You are about to alter the column `money` on the `player` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Int`.

*/
-- AlterTable
ALTER TABLE `player` MODIFY `money` INTEGER NOT NULL DEFAULT 0;
