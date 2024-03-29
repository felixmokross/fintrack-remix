import type { AccountGroup, User } from "@prisma/client";
import { prisma } from "~/db.server";
import type { FormErrors } from "~/utils";

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
  return prisma.accountGroup.findUnique({
    select: { id: true, name: true },
    where: { id_userId: { id, userId } },
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
      userId,
    },
  });
}

export async function updateAccountGroup({
  id,
  name,
  userId,
}: Pick<AccountGroup, "id" | "name"> & {
  userId: User["id"];
}) {
  return await prisma.accountGroup.update({
    where: { id_userId: { id, userId } },
    data: { name },
  });
}

export function deleteAccountGroup({
  id,
  userId,
}: Pick<AccountGroup, "id" | "userId">) {
  return prisma.accountGroup.delete({ where: { id_userId: { id, userId } } });
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

export type AccountGroupErrors = FormErrors<AccountGroupValues>;
