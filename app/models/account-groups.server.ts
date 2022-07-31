import type { AccountGroup, User } from "@prisma/client";
import { prisma } from "~/db.server";

export function getAccountGroupListItems({ userId }: { userId: User["id"] }) {
  return prisma.accountGroup.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export function getAccountGroup({
  id,
  userId,
}: Pick<AccountGroup, "id"> & {
  userId: User["id"];
}) {
  return prisma.accountGroup.findFirst({
    select: { id: true, name: true },
    where: { id, userId },
  });
}

export function createAccountGroup({
  name,
  userId,
}: Pick<AccountGroup, "name"> & {
  userId: User["id"];
}) {
  return prisma.accountGroup.create({
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

export async function accountGroupExists({
  id,
  userId,
}: Pick<AccountGroup, "id" | "userId">) {
  return (await prisma.accountGroup.count({ where: { id, userId } })) > 0;
}

export async function updateAccountGroup({
  id,
  name,
  userId,
}: Pick<AccountGroup, "id" | "name"> & {
  userId: User["id"];
}) {
  if (!(await accountGroupExists({ id, userId })))
    throw new Error("Account group not found");

  return await prisma.accountGroup.update({
    where: { id },
    data: { name },
  });
}

export function deleteAccountGroup({
  id,
  userId,
}: Pick<AccountGroup, "id" | "userId">) {
  return prisma.accountGroup.deleteMany({ where: { id, userId } });
}

export function validateAccountGroup({ name }: AccountGroupValues) {
  const errors: AccountGroupErrors = {};
  if (name.length === 0) {
    errors.name = "Name is required";
  }

  return errors;
}

export type AccountGroupValues = {
  name: string;
};

export type AccountGroupErrors = {
  name?: string;
};
