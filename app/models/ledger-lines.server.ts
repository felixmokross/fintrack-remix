import type { Account, User } from "@prisma/client";
import { BookingType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";
import { prisma } from "~/db.server";
import type { getAccount } from "./account.server";

export async function getReverseLedgerDateGroups({
  account,
  userId,
}: {
  account: NonNullable<Awaited<ReturnType<typeof getAccount>>>;
  userId: User["id"];
}) {
  const ledgerLines = await getLedgerLines({ account, userId });
  ledgerLines.reverse();

  return Array.from(
    ledgerLines
      .reduce((acc, line) => {
        const dateKey = line.transaction.date.valueOf();

        if (!acc.has(dateKey)) {
          acc.set(dateKey, {
            date: line.transaction.date,
            lines: [line],
            balance: line.balance,
          });
        } else {
          acc.get(dateKey)!.lines.push(line);
        }

        return acc;
      }, new Map<number, LedgerDateGroup>())
      .values()
  );
}

export type LedgerDateGroup = {
  date: Date;
  lines: LedgerLine[];
  balance: Decimal;
};

export async function getLedgerLines({
  account,
  userId,
}: {
  account: NonNullable<Awaited<ReturnType<typeof getAccount>>>;
  userId: User["id"];
}) {
  const bookings = await getBookings({ accountId: account.id, userId });

  return bookings.reduce<Accumulator>(
    (acc, booking) => {
      acc.balance = acc.balance.plus(getBookingValue(booking));
      acc.lines.push({ ...booking, balance: acc.balance });
      return acc;
    },
    {
      balance: new Decimal(
        (account.preExisting && account.balanceAtStart) || 0
      ),
      lines: [],
    }
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
          id: true,
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
