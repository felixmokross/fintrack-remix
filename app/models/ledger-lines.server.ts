import type { Account, User } from "@prisma/client";
import { BookingType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";
import { prisma } from "~/db.server";

export async function getLedgerLines({
  accountId,
  userId,
}: {
  accountId: Account["id"];
  userId: User["id"];
}) {
  const bookings = await getBookings({ accountId, userId });

  return bookings.reduce<Accumulator>(
    (acc, booking) => {
      acc.balance = acc.balance.plus(getBookingValue(booking));
      acc.lines.push({ ...booking, balance: acc.balance });
      return acc;
    },
    { balance: new Decimal(0), lines: [] }
  ).lines;
}

function getBookingValue(booking: Booking) {
  switch (booking.type) {
    case BookingType.CHARGE:
      return booking.amount.negated();
    case BookingType.DEPOSIT:
      return booking.amount;
    default:
      throw new Error("Unexpected");
  }
}

type Accumulator = {
  balance: Decimal;
  lines: LedgerLine[];
};

export type LedgerLine = Booking & {
  balance: Decimal;
};

type Booking = Awaited<ReturnType<typeof getBookings>>[number];

async function getBookings({
  accountId,
  userId,
}: {
  accountId: Account["id"];
  userId: User["id"];
}) {
  return await prisma.booking.findMany({
    where: {
      type: { in: [BookingType.DEPOSIT, BookingType.CHARGE] },
      accountId,
      userId,
    },
    select: {
      id: true,
      type: true,
      transaction: {
        select: {
          date: true,
          note: true,
          bookings: {
            select: {
              id: true,
              type: true,
              account: { select: { name: true } },
              incomeExpenseCategory: { select: { name: true } },
              note: true,
            },
          },
        },
      },
      note: true,
      amount: true,
    },
    orderBy: [
      { transaction: { date: "asc" } },
      { transaction: { createdAt: "asc" } },
    ],
  });
}
