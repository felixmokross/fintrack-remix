import type { AssetClass, User } from "@prisma/client";
import { prisma } from "~/db.server";

export function getAssetClassListItems({ userId }: { userId: User["id"] }) {
  return prisma.assetClass.findMany({
    where: { userId },
    select: { id: true, name: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  });
}

export function getAssetClass({
  id,
  userId,
}: Pick<AssetClass, "id"> & {
  userId: User["id"];
}) {
  return prisma.assetClass.findFirst({
    select: { id: true, name: true, sortOrder: true },
    where: { id, userId },
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

export function updateAssetClass({
  id,
  name,
  sortOrder,
  userId,
}: Pick<AssetClass, "id" | "name" | "sortOrder"> & {
  userId: User["id"];
}) {
  return prisma.assetClass.updateMany({
    where: { id, userId },
    data: { name, sortOrder },
  });
}

export function deleteAssetClass({
  id,
  userId,
}: Pick<AssetClass, "id" | "userId">) {
  return prisma.assetClass.deleteMany({ where: { id, userId } });
}
