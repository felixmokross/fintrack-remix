import type { AccountGroup, User } from "@prisma/client";
import { prisma } from "~/db.server";

export function getAccountGroupListItems({ userId }: { userId: User["id"] }) {
  return prisma.accountGroup.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
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

export function deleteAccountGroup({
  id,
  userId,
}: Pick<AccountGroup, "id" | "userId">) {
  return prisma.accountGroup.deleteMany({ where: { id, userId } });
}
