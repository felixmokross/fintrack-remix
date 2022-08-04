-- CreateTable
CREATE TABLE "LiveCurrencyRate" (
    "code" TEXT NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveCurrencyRate_pkey" PRIMARY KEY ("code")
);
