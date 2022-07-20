import type { Account, User } from "@prisma/client";
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

export function deleteAccount({ id }: Pick<Account, "id">) {
  return prisma.account.delete({ where: { id } });
}
