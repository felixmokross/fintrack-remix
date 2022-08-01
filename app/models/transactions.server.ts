import type { Booking, Transaction, User } from "@prisma/client";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";

export async function getTransactionValues(
  request: Request
): Promise<TransactionValues> {
  const formData = await request.formData();
  const date = formData.get("date");
  const note = formData.get("note");

  invariant(typeof date === "string", "date not found");
  invariant(typeof note === "string", "note not found");

  const bookings = new Array<BookingValues>(
    Number(formData.get("bookingsCount"))
  );

  for (let i = 0; i < bookings.length; i++) {
    const type = formData.get(`bookings.${i}.type`);
    const accountId = formData.get(`bookings.${i}.accountId`);
    const categoryId = formData.get(`bookings.${i}.categoryId`);
    const currency = formData.get(`bookings.${i}.currency`);
    const note = formData.get(`bookings.${i}.note`);
    const amount = formData.get(`bookings.${i}.amount`);

    invariant(typeof type === "string", "type not found");
    invariant(
      !accountId || typeof accountId === "string",
      "accountId not found"
    );
    invariant(
      !categoryId || typeof categoryId === "string",
      "categoryId not found"
    );
    invariant(!currency || typeof currency === "string", "currency not found");
    invariant(!note || typeof note === "string", "note not found");
    invariant(typeof amount === "string", "amount not found");

    bookings[i] = { type, accountId, categoryId, currency, note, amount };
  }

  return { date, note, bookings };
}

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
  return prisma.transaction.findFirst({
    where: { id, userId },
    select: {
      id: true,
      date: true,
      note: true,
      bookings: {
        select: {
          id: true,
          type: true,
          sortOrder: true,
          accountId: true,
          incomeExpenseCategoryId: true,
          currency: true,
          note: true,
          amount: true,
        },
        orderBy: { sortOrder: "asc" },
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
          (
            {
              type,
              accountId,
              incomeExpenseCategoryId,
              currency,
              note,
              amount,
            },
            index
          ) => ({
            type,
            sortOrder: index,
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
      user: { connect: { id: userId } },
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
          (
            {
              type,
              accountId,
              incomeExpenseCategoryId,
              currency,
              note,
              amount,
            },
            index
          ) => ({
            type,
            sortOrder: index,
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
      user: { connect: { id: userId } },
    },
  });
}

export function deleteTransaction({
  id,
  userId,
}: Pick<Transaction, "id" | "userId">) {
  return prisma.transaction.deleteMany({ where: { id, userId } });
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
