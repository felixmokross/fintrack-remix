/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `AssetClass` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Booking` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `IncomeExpenseCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Stock` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Transaction` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_assetClassId_fkey";

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_stockId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_incomeExpenseCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_transactionId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id", "userId");

-- AlterTable
ALTER TABLE "AssetClass" DROP CONSTRAINT "AssetClass_pkey",
ADD CONSTRAINT "AssetClass_pkey" PRIMARY KEY ("id", "userId");

-- AlterTable
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_pkey",
ADD CONSTRAINT "Booking_pkey" PRIMARY KEY ("id", "userId");

-- AlterTable
ALTER TABLE "IncomeExpenseCategory" DROP CONSTRAINT "IncomeExpenseCategory_pkey",
ADD CONSTRAINT "IncomeExpenseCategory_pkey" PRIMARY KEY ("id", "userId");

-- AlterTable
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_pkey",
ADD CONSTRAINT "Stock_pkey" PRIMARY KEY ("id", "userId");

-- AlterTable
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_pkey",
ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id", "userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_assetClassId_userId_fkey" FOREIGN KEY ("assetClassId", "userId") REFERENCES "AssetClass"("id", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_stockId_userId_fkey" FOREIGN KEY ("stockId", "userId") REFERENCES "Stock"("id", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_accountId_userId_fkey" FOREIGN KEY ("accountId", "userId") REFERENCES "Account"("id", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_transactionId_userId_fkey" FOREIGN KEY ("transactionId", "userId") REFERENCES "Transaction"("id", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_incomeExpenseCategoryId_userId_fkey" FOREIGN KEY ("incomeExpenseCategoryId", "userId") REFERENCES "IncomeExpenseCategory"("id", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;
