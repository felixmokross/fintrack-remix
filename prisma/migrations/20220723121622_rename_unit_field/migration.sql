/*
  Warnings:

  - You are about to drop the column `accountUnit` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "accountUnit",
ADD COLUMN     "unit" "AccountUnit" NOT NULL DEFAULT 'CURRENCY';
