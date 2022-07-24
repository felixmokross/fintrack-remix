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
  const payload = {
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
  };
  console.log(JSON.stringify(payload, null, 2));
  return prisma.transaction.create(payload);
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
