import type { Account, User } from "@prisma/client";
import { AccountType } from "@prisma/client";
import { prisma } from "~/db.server";

export function getAccountListItems({ userId }: { userId: User["id"] }) {
  return prisma.account.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createAccount({
  name,
  userId,
}: Pick<Account, "name"> & {
  userId: User["id"];
}) {
  return prisma.account.create({
    data: {
      name,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export type AccountValues = {
  name: string;
  accountType: string;
  assetClassId: string | null;
};

export type AccountErrors = {
  name?: string;
  accountType?: string;
  assetClassId?: string;
};

export function validateAccount({
  name,
  accountType,
  assetClassId,
}: AccountValues) {
  const errors: AccountErrors = {};

  if (name.length === 0) {
    errors.name = "Name is required";
  }

  if (accountType.length === 0) {
    errors.accountType = "Account type is required";
  }

  if (accountType === AccountType.ASSET && !assetClassId) {
    errors.assetClassId = "Asset class is required";
  }

  return errors;
}

export function deleteAccount({ id, userId }: Pick<Account, "id" | "userId">) {
  return prisma.account.deleteMany({ where: { id, userId } });
}
