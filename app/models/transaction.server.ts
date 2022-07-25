import type { Booking, Transaction, User } from "@prisma/client";
import { prisma } from "~/db.server";
import { isValidDate } from "~/shared/util";

export function getTransactionListItems({ userId }: { userId: User["id"] }) {
  return prisma.transaction.findMany({
    where: { userId },
    select: { id: true, date: true, note: true },
    orderBy: { date: "desc" },
  });
}

export function getTransaction({
  id,
  userId,
}: {
  id: Transaction["id"];
  userId: User["id"];
}) {
  return prisma.transaction.findMany({
    where: { id, userId },
    select: {
      id: true,
      date: true,
      note: true,
      bookings: {
        select: {
          id: true,
          type: true,
          accountId: true,
          incomeExpenseCategoryId: true,
          currency: true,
          note: true,
          amount: true,
        },
      },
    },
  });
}

export function createTransaction({
  date,
  note,
  bookings,
  userId,
}: Pick<Transaction, "date" | "note"> & {
  bookings: Pick<
    Booking,
    | "type"
    | "accountId"
    | "incomeExpenseCategoryId"
    | "currency"
    | "note"
    | "amount"
  >[];
  userId: User["id"];
}) {
  return prisma.transaction.create({
    data: {
      date,
      note,
      bookings: {
        create: bookings.map(
          ({
            type,
            accountId,
            incomeExpenseCategoryId,
            currency,
            note,
            amount,
          }) => ({
            type,
            account: accountId ? { connect: { id: accountId } } : undefined,
            incomeExpenseCategory: incomeExpenseCategoryId
              ? { connect: { id: incomeExpenseCategoryId } }
              : undefined,
            currency,
            note,
            amount,
            user: { connect: { id: userId } },
          })
        ),
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function transactionExists({
  id,
  userId,
}: Pick<Transaction, "id" | "userId">) {
  return (await prisma.transaction.count({ where: { id, userId } })) > 0;
}

export async function updateTransaction({
  id,
  date,
  note,
  bookings,
  userId,
}: Pick<Transaction, "id" | "date" | "note"> & {
  bookings: Pick<
    Booking,
    | "type"
    | "accountId"
    | "incomeExpenseCategoryId"
    | "currency"
    | "note"
    | "amount"
  >[];
  userId: User["id"];
}) {
  if (!(await transactionExists({ id, userId })))
    throw new Error("Transaction not found");

  return await prisma.transaction.update({
    where: { id },
    data: {
      date,
      note,
      bookings: {
        deleteMany: {},
        create: bookings.map(
          ({
            type,
            accountId,
            incomeExpenseCategoryId,
            currency,
            note,
            amount,
          }) => ({
            type,
            account: accountId ? { connect: { id: accountId } } : undefined,
            incomeExpenseCategory: incomeExpenseCategoryId
              ? { connect: { id: incomeExpenseCategoryId } }
              : undefined,
            currency,
            note,
            amount,
            user: { connect: { id: userId } },
          })
        ),
      },
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
  bookings: BookingValues[];
};

export type BookingValues = {
  type: string;
  accountId: string | null;
  categoryId: string | null;
  currency: string | null;
  note: string | null;
  amount: string;
};

export type TransactionErrors = {
  date?: string;
  note?: string;
};
