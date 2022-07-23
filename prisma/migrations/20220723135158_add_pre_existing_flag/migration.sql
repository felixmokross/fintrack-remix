/*
  Warnings:

  - You are about to drop the column `openingBalance` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "openingBalance",
ADD COLUMN     "balanceAtStart" DECIMAL(65,30),
ADD COLUMN     "preExisting" BOOLEAN NOT NULL DEFAULT false;
