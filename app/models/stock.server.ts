import type { Stock, User } from "@prisma/client";
import { currenciesByCode } from "~/currencies";
import { prisma } from "~/db.server";

export function getStockListItems({ userId }: { userId: User["id"] }) {
  return prisma.stock.findMany({
    where: { userId },
    select: { id: true, tradingCurrency: true },
    orderBy: { id: "asc" },
  });
}

export function getStock({
  id,
  userId,
}: Pick<Stock, "id"> & {
  userId: User["id"];
}) {
  return prisma.stock.findFirst({
    select: { id: true, tradingCurrency: true },
    where: { id, userId },
  });
}

export function createStock({
  id,
  tradingCurrency,
  userId,
}: Pick<Stock, "id" | "tradingCurrency"> & {
  userId: User["id"];
}) {
  return prisma.stock.create({
    data: {
      id: id.toUpperCase(),
      tradingCurrency,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function updateStock({
  id,
  tradingCurrency,
  userId,
  previousId,
}: Pick<Stock, "id" | "tradingCurrency"> & {
  userId: User["id"];
  previousId: string;
}) {
  return prisma.stock.updateMany({
    where: { id: previousId, userId },
    data: { id, tradingCurrency },
  });
}

export function deleteStock({ id, userId }: Pick<Stock, "id" | "userId">) {
  return prisma.stock.deleteMany({ where: { id, userId } });
}

export async function validateStock(
  { id, tradingCurrency }: StockValues,
  userId: User["id"],
  previousId?: string
) {
  const errors: StockErrors = {};

  if (id.length === 0) {
    errors.id = "Symbol is required";
  } else if (
    (!previousId || id !== previousId) &&
    (await prisma.stock.findFirst({
      where: { id: id.toUpperCase(), userId },
    })) !== null
  ) {
    errors.id = "Stock already exists";
  }

  if (tradingCurrency.length === 0) {
    errors.tradingCurrency = "Trading currency is required";
  } else if (!Object.keys(currenciesByCode).includes(tradingCurrency)) {
    errors.tradingCurrency = "Trading currency is not supported";
  }

  return errors;
}

export type StockValues = {
  id: string;
  tradingCurrency: string;
};

export type StockErrors = {
  id?: string;
  tradingCurrency?: string;
};
