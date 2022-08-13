-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredLocale" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "refCurrency" TEXT NOT NULL DEFAULT 'USD';
