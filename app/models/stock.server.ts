import type { Stock, User } from "@prisma/client";
import { prisma } from "~/db.server";

export function getStockListItems({ userId }: { userId: User["id"] }) {
  return prisma.stock.findMany({
    where: { userId },
    select: { id: true, tradingCurrency: true },
    orderBy: { id: "asc" },
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
      id,
      tradingCurrency,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteStock({ id, userId }: Pick<Stock, "id" | "userId">) {
  return prisma.stock.deleteMany({ where: { id } });
}

export function validateStock({ id, tradingCurrency }: StockValues) {
  const errors: StockErrors = {};
  if (id.length === 0) {
    errors.id = "ID is required";
  }
  if (tradingCurrency.length === 0) {
    errors.tradingCurrency = "Trading currency is required";
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
