import type { Booking, Transaction, User } from "@prisma/client";
import { BookingType } from "@prisma/client";
import invariant from "tiny-invariant";
import { cache } from "~/cache.server";
import { prisma } from "~/db.server";
import { uniq } from "~/utils.server";

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
  return prisma.transaction.findUnique({
    where: { id_userId: { id, userId } },
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

export async function createTransaction({
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
  await prisma.transaction.create({
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
            account: accountId
              ? { connect: { id_userId: { id: accountId, userId } } }
              : undefined,
            incomeExpenseCategory: incomeExpenseCategoryId
              ? {
                  connect: {
                    id_userId: { id: incomeExpenseCategoryId, userId },
                  },
                }
              : undefined,
            currency,
            note,
            amount,
            user: { connect: { id: userId } },
          })
        ),
      },
      userId,
    },
  });

  cache.invalidate(userId, getAccountIdsFromBookings(bookings));
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
  const [originalTransaction] = await prisma.$transaction([
    prisma.transaction.findUniqueOrThrow({
      where: { id_userId: { userId, id } },
      select: { bookings: { select: { type: true, accountId: true } } },
    }),
    prisma.transaction.update({
      where: { id_userId: { id, userId } },
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
              account: accountId
                ? { connect: { id_userId: { id: accountId, userId } } }
                : undefined,
              incomeExpenseCategory: incomeExpenseCategoryId
                ? {
                    connect: {
                      id_userId: { id: incomeExpenseCategoryId, userId },
                    },
                  }
                : undefined,
              currency,
              note,
              amount,
              user: { connect: { id: userId } },
            })
          ),
        },
        userId,
      },
    }),
  ]);

  cache.invalidate(
    userId,
    getAccountIdsFromBookings(originalTransaction.bookings.concat(bookings))
  );
}

export async function deleteTransaction({
  id,
  userId,
}: Pick<Transaction, "id" | "userId">) {
  const transaction = await prisma.transaction.delete({
    where: { id_userId: { id, userId } },
    select: { bookings: { select: { type: true, accountId: true } } },
  });

  cache.invalidate(userId, getAccountIdsFromBookings(transaction.bookings));
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

function getAccountIdsFromBookings(
  bookings: Pick<Booking, "type" | "accountId">[]
) {
  return uniq(
    bookings
      .filter(
        (booking) =>
          booking.type === BookingType.CHARGE ||
          booking.type === BookingType.DEPOSIT
      )
      .map((booking) => {
        invariant(booking.accountId, "accountId not found");
        return booking.accountId;
      })
  );
}
