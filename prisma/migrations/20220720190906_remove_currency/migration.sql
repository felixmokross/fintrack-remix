/*
  Warnings:

  - You are about to drop the column `currencyId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `tradingCurrencyId` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the `Currency` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `AccountGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `AssetClass` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tradingCurrency` to the `Stock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_tradingCurrencyId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "currencyId",
ADD COLUMN     "currency" TEXT;

-- AlterTable
ALTER TABLE "AccountGroup" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AssetClass" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "tradingCurrencyId",
ADD COLUMN     "tradingCurrency" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Currency";

-- AddForeignKey
ALTER TABLE "AssetClass" ADD CONSTRAINT "AssetClass_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountGroup" ADD CONSTRAINT "AccountGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
