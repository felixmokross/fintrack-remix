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
  type,
  assetClassId,
  groupId,
  userId,
}: Pick<Account, "name" | "type" | "assetClassId" | "groupId"> & {
  userId: User["id"];
}) {
  return prisma.account.create({
    data: {
      name,
      type,
      assetClass: assetClassId ? { connect: { id: assetClassId } } : undefined,
      group: groupId ? { connect: { id: groupId } } : undefined,
      user: { connect: { id: userId } },
    },
  });
}

export type AccountValues = {
  name: string;
  type: string;
  assetClassId: string | null;
  groupId: string;
};

export type AccountErrors = {
  name?: string;
  type?: string;
  assetClassId?: string;
  groupId?: string;
};

export function validateAccount({ name, type, assetClassId }: AccountValues) {
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

  return errors;
}

export function deleteAccount({ id, userId }: Pick<Account, "id" | "userId">) {
  return prisma.account.deleteMany({ where: { id, userId } });
}
