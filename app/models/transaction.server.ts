import type { Transaction, User } from "@prisma/client";
import { prisma } from "~/db.server";
import { isValidDate } from "~/shared/util";

export function getTransactionListItems({ userId }: { userId: User["id"] }) {
  return prisma.transaction.findMany({
    where: { userId },
    select: { id: true, date: true, note: true },
    orderBy: { date: "desc" },
  });
}

export function createTransaction({
  date,
  note,
  userId,
}: Pick<Transaction, "date" | "note"> & {
  userId: User["id"];
}) {
  return prisma.transaction.create({
    data: {
      date,
      note,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteTransaction({
  id,
  userId,
}: Pick<Transaction, "id" | "userId">) {
  return prisma.transaction.deleteMany({ where: { id, userId } });
}

export function validateTransaction({ date, note }: TransactionValues) {
  const errors: TransactionErrors = {};
  if (date.length === 0) {
    errors.date = "Date is required";
  } else if (!isValidDate(date)) {
    errors.date = "Date must be a date";
  }

  return errors;
}

export type TransactionValues = {
  date: string;
  note?: string;
};

export type TransactionErrors = {
  date?: string;
  note?: string;
};
