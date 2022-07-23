import type { Account, User } from "@prisma/client";
import { AccountUnit } from "@prisma/client";
import { AccountType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";
import { prisma } from "~/db.server";

export function getAccountListItems({ userId }: { userId: User["id"] }) {
  return prisma.account.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      group: true,
      type: true,
      assetClass: true,
      unit: true,
      currency: true,
      stockId: true,
      preExisting: true,
      balanceAtStart: true,
      openingDate: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export function createAccount({
  name,
  type,
  assetClassId,
  groupId,
  unit,
  currency,
  stockId,
  userId,
  preExisting,
  balanceAtStart,
}: Pick<
  Account,
  | "name"
  | "type"
  | "assetClassId"
  | "groupId"
  | "unit"
  | "currency"
  | "stockId"
  | "preExisting"
  | "balanceAtStart"
> & {
  userId: User["id"];
}) {
  return prisma.account.create({
    data: {
      name,
      type,
      assetClass: assetClassId ? { connect: { id: assetClassId } } : undefined,
      group: groupId ? { connect: { id: groupId } } : undefined,
      unit,
      currency,
      stock: stockId ? { connect: { id: stockId } } : undefined,
      preExisting,
      balanceAtStart,
      user: { connect: { id: userId } },
    },
  });
}

export type AccountValues = {
  name: string;
  type: string;
  assetClassId: string | null;
  groupId: string;
  unit: string;
  currency: string | null;
  stockId: string | null;
  preExisting: "on" | null;
  balanceAtStart: string | null;
};

export type AccountErrors = {
  name?: string;
  type?: string;
  assetClassId?: string;
  groupId?: string;
  unit?: string;
  currency?: string;
  stockId?: string;
  preExisting?: string;
  balanceAtStart?: string;
};

export function validateAccount({
  name,
  type,
  assetClassId,
  unit,
  currency,
  stockId,
  preExisting,
  balanceAtStart,
}: AccountValues) {
  const errors: AccountErrors = {};

  if (name.length === 0) {
    errors.name = "Name is required";
  }

  if (type.length === 0) {
    errors.type = "Type is required";
  }

  if (type === AccountType.ASSET && !assetClassId) {
    errors.assetClassId = "Asset class is required";
  }

  if (unit.length === 0) {
    errors.type = "Unit is required";
  }

  if (unit === AccountUnit.CURRENCY && !currency) {
    errors.currency = "Currency is required";
  }

  if (unit === AccountUnit.STOCK && !stockId) {
    errors.stockId = "Stock is required";
  }

  if (preExisting === "on") {
    if (!balanceAtStart) {
      errors.balanceAtStart = "Balance at start is required";
    } else if (parseBalanceAtStart(balanceAtStart).isNaN()) {
      errors.balanceAtStart = "Balance at start must be a number";
    }
  }

  return errors;
}

export function deleteAccount({ id, userId }: Pick<Account, "id" | "userId">) {
  return prisma.account.deleteMany({ where: { id, userId } });
}

export function parseBalanceAtStart(balanceAtStart: string) {
  return new Decimal(balanceAtStart);
}
