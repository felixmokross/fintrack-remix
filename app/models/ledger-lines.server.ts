import type { Account, User } from "@prisma/client";
import { BookingType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";
import { prisma } from "~/db.server";
import { formatDate, formatMoney } from "~/formatting.server";
import type { getAccount } from "./accounts.server";

export async function getReverseLedgerDateGroups({
  account,
  userId,
}: {
  account: NonNullable<Awaited<ReturnType<typeof getAccount>>>;
  userId: User["id"];
}) {
  const { preferredLocale } = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { preferredLocale: true },
  });
  const ledgerLines = await getLedgerLines({ account, userId });
  ledgerLines.reverse();

  const groupByDate = new Map<number, LedgerDateGroup>();

  for (const line of ledgerLines) {
    const dateKey = line.transaction.date.valueOf();

    if (!groupByDate.has(dateKey)) {
      groupByDate.set(dateKey, {
        date: line.transaction.date,
        lines: [line],
        balance: line.balance,
      });
    } else {
      groupByDate.get(dateKey)!.lines.push(line);
    }
  }

  return Array.from(groupByDate.values()).map((group) => ({
    ...group,
    dateFormatted: formatDate(group.date, preferredLocale),
    lines: group.lines.map((line) => ({
      ...line,
      amountFormatted: formatMoney(
        line.amount,
        account.currency,
        preferredLocale
      ),
    })),
    balanceFormatted: formatMoney(
      group.balance,
      account.currency,
      preferredLocale
    ),
  }));
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

  let balance = new Decimal(
    (account.preExisting && account.balanceAtStart) || 0
  );
  const lines = [];

  for (const booking of bookings) {
    balance = balance.plus(getBookingValue(booking));
    lines.push({ ...booking, balance });
  }

  return lines;
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
