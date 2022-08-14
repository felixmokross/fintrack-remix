import type { AssetClass, User } from "@prisma/client";
import { cache } from "~/cache.server";
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
  return prisma.assetClass.findUnique({
    select: { id: true, name: true, sortOrder: true },
    where: { id_userId: { id, userId } },
  });
}

export async function createAssetClass({
  name,
  sortOrder,
  userId,
}: Pick<AssetClass, "name" | "sortOrder"> & {
  userId: User["id"];
}) {
  await prisma.assetClass.create({
    data: {
      name,
      sortOrder,
      userId,
    },
  });
}

export async function updateAssetClass({
  id,
  name,
  sortOrder,
  userId,
}: Pick<AssetClass, "id" | "name" | "sortOrder"> & {
  userId: User["id"];
}) {
  await prisma.assetClass.update({
    where: { id_userId: { id, userId } },
    data: { name, sortOrder },
  });

  cache.invalidateAccounts(userId, []);
}

export function deleteAssetClass({
  id,
  userId,
}: Pick<AssetClass, "id" | "userId">) {
  return prisma.assetClass.delete({ where: { id_userId: { id, userId } } });
}

export function validateAssetClass({ name, sortOrder }: AssetClassValues) {
  const errors: AssetClassErrors = {};
  if (name.length === 0) {
    errors.name = "Name is required";
  }

  if (sortOrder.length === 0) {
    errors.sortOrder = "Sort order is required";
  } else if (isNaN(parseSortOrder(sortOrder))) {
    errors.sortOrder = "Sort order must be a number";
  }

  return errors;
}

export function parseSortOrder(sortOrder: string) {
  return parseInt(sortOrder, 10);
}

export type AssetClassValues = {
  name: string;
  sortOrder: string;
};

export type AssetClassErrors = {
  name?: string;
  sortOrder?: string;
};
