import type { Stock, User } from "@prisma/client";
import { currenciesByCode } from "~/currencies";
import { prisma } from "~/db.server";

export function getStockListItems({ userId }: { userId: User["id"] }) {
  return prisma.stock.findMany({
    where: { userId },
    select: { id: true, symbol: true, tradingCurrency: true },
    orderBy: { id: "asc" },
  });
}

export function getStock({
  id,
  userId,
}: Pick<Stock, "id"> & {
  userId: User["id"];
}) {
  return prisma.stock.findUnique({
    select: { id: true, symbol: true, tradingCurrency: true },
    where: { id_userId: { id, userId } },
  });
}

export function createStock({
  symbol,
  tradingCurrency,
  userId,
}: Pick<Stock, "symbol" | "tradingCurrency"> & {
  userId: User["id"];
}) {
  return prisma.stock.create({
    data: {
      symbol: symbol.toUpperCase(),
      tradingCurrency,
      user: { connect: { id: userId } },
    },
  });
}

export async function updateStock({
  id,
  symbol,
  tradingCurrency,
  userId,
}: Pick<Stock, "id" | "symbol" | "tradingCurrency"> & {
  userId: User["id"];
}) {
  return await prisma.stock.update({
    where: { id_userId: { id, userId } },
    data: { symbol, tradingCurrency },
  });
}

export function deleteStock({ id, userId }: Pick<Stock, "id" | "userId">) {
  return prisma.stock.delete({ where: { id_userId: { id, userId } } });
}

export function validateStock({ symbol, tradingCurrency }: StockValues) {
  const errors: StockErrors = {};

  if (symbol.length === 0) {
    errors.symbol = "Symbol is required";
  }

  if (tradingCurrency.length === 0) {
    errors.tradingCurrency = "Trading currency is required";
  } else if (!Object.keys(currenciesByCode).includes(tradingCurrency)) {
    errors.tradingCurrency = "Trading currency is not supported";
  }

  return errors;
}

export type StockValues = {
  symbol: string;
  tradingCurrency: string;
};

export type StockErrors = {
  symbol?: string;
  tradingCurrency?: string;
};
