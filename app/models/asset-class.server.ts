import type { AssetClass, User } from "@prisma/client";
import { prisma } from "~/db.server";

export function getAssetClassListItems({ userId }: { userId: User["id"] }) {
  return prisma.assetClass.findMany({
    where: { userId },
    select: { id: true, name: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  });
}

export function createAssetClass({
  name,
  sortOrder,
  userId,
}: Pick<AssetClass, "name" | "sortOrder"> & {
  userId: User["id"];
}) {
  return prisma.assetClass.create({
    data: {
      name,
      sortOrder,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteAssetClass({ id }: Pick<AssetClass, "id">) {
  return prisma.assetClass.delete({ where: { id } });
}
