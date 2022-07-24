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

export function getIncomeExpenseCategory({
  id,
  userId,
}: Pick<IncomeExpenseCategory, "id"> & {
  userId: User["id"];
}) {
  return prisma.incomeExpenseCategory.findFirst({
    select: { id: true, name: true, type: true },
    where: { id, userId },
  });
}

export function createIncomeCategory({
  name,
  userId,
}: Pick<IncomeExpenseCategory, "name"> & {
  userId: User["id"];
}) {
  return prisma.incomeExpenseCategory.create({
    data: {
      name,
      type: IncomeExpenseCategoryType.INCOME,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function createExpenseCategory({
  name,
  userId,
}: Pick<IncomeExpenseCategory, "name"> & {
  userId: User["id"];
}) {
  return prisma.incomeExpenseCategory.create({
    data: {
      name,
      type: IncomeExpenseCategoryType.EXPENSE,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function incomeExpenseCategoryExists({
  id,
  userId,
}: Pick<IncomeExpenseCategory, "id" | "userId">) {
  return (
    (await prisma.incomeExpenseCategory.count({ where: { id, userId } })) > 0
  );
}

export async function updateIncomeExpenseCategory({
  id,
  name,
  userId,
}: Pick<IncomeExpenseCategory, "id" | "name"> & {
  userId: User["id"];
}) {
  if (!(await incomeExpenseCategoryExists({ id, userId })))
    throw new Error("Income/expense category not found");

  return await prisma.incomeExpenseCategory.update({
    where: { id },
    data: { name },
  });
}

export function deleteIncomeExpenseCategory({
  id,
  userId,
}: Pick<IncomeExpenseCategory, "id" | "userId">) {
  return prisma.incomeExpenseCategory.deleteMany({ where: { id, userId } });
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
