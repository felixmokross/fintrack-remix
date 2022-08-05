import type { IncomeExpenseCategory, User } from "@prisma/client";
import { IncomeExpenseCategoryType } from "@prisma/client";
import { prisma } from "~/db.server";

export function getIncomeCategoryListItems({ userId }: { userId: User["id"] }) {
  return prisma.incomeExpenseCategory.findMany({
    where: { userId, type: IncomeExpenseCategoryType.INCOME },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export function getExpenseCategoryListItems({
  userId,
}: {
  userId: User["id"];
}) {
  return prisma.incomeExpenseCategory.findMany({
    where: { userId, type: IncomeExpenseCategoryType.EXPENSE },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export function getIncomeExpenseCategoryListItems({
  userId,
}: {
  userId: User["id"];
}) {
  return prisma.incomeExpenseCategory.findMany({
    where: { userId },
    select: { id: true, name: true, type: true },
    orderBy: { name: "asc" },
  });
}

export function getIncomeExpenseCategory({
  id,
  userId,
}: Pick<IncomeExpenseCategory, "id"> & {
  userId: User["id"];
}) {
  return prisma.incomeExpenseCategory.findUnique({
    select: { id: true, name: true, type: true },
    where: { id_userId: { id, userId } },
  });
}

export function createIncomeExpenseCategory({
  name,
  type,
  userId,
}: Pick<IncomeExpenseCategory, "name" | "type"> & {
  userId: User["id"];
}) {
  return prisma.incomeExpenseCategory.create({
    data: {
      name,
      type,
      userId,
    },
  });
}

export async function updateIncomeExpenseCategory({
  id,
  name,
  userId,
}: Pick<IncomeExpenseCategory, "id" | "name"> & {
  userId: User["id"];
}) {
  return await prisma.incomeExpenseCategory.update({
    where: { id_userId: { id, userId } },
    data: { name },
  });
}

export function deleteIncomeExpenseCategory({
  id,
  userId,
}: Pick<IncomeExpenseCategory, "id" | "userId">) {
  return prisma.incomeExpenseCategory.delete({
    where: { id_userId: { id, userId } },
  });
}

export function validateIncomeExpenseCategory({
  name,
}: IncomeExpenseCategoryValues) {
  const errors: IncomeExpenseCategoryErrors = {};
  if (name.length === 0) {
    errors.name = "Name is required";
  }

  return errors;
}

export type IncomeExpenseCategoryValues = {
  name: string;
};

export type IncomeExpenseCategoryErrors = {
  name?: string;
};
