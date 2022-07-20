-- CreateEnum
CREATE TYPE "AccountUnit" AS ENUM ('CURRENCY', 'STOCK');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY');

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "accountUnit" "AccountUnit" NOT NULL DEFAULT 'CURRENCY',
ADD COLUMN     "assetClassId" TEXT,
ADD COLUMN     "closingDate" DATE,
ADD COLUMN     "currencyId" TEXT,
ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "openingBalance" DECIMAL(65,30),
ADD COLUMN     "openingDate" DATE,
ADD COLUMN     "stockId" TEXT,
ADD COLUMN     "type" "AccountType" NOT NULL DEFAULT 'ASSET';

-- CreateTable
CREATE TABLE "AssetClass" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AssetClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AccountGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "tradingCurrencyId" TEXT NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_assetClassId_fkey" FOREIGN KEY ("assetClassId") REFERENCES "AssetClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AccountGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_tradingCurrencyId_fkey" FOREIGN KEY ("tradingCurrencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
