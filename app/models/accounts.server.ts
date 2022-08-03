import type { Account, User } from "@prisma/client";
import { BookingType } from "@prisma/client";
import { AccountUnit } from "@prisma/client";
import { AccountType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import type { FormErrors } from "~/utils";
import { isValidDate, isValidDecimal, sum } from "~/utils.server";

export async function getAccountValues(
  request: Request
): Promise<AccountValues> {
  const formData = await request.formData();
  const name = formData.get("name");
  const type = formData.get("type");
  const assetClassId = formData.get("assetClassId");
  const groupId = formData.get("groupId");
  const unit = formData.get("unit");
  const currency = formData.get("currency");
  const stockId = formData.get("stockId");
  const preExisting = formData.get("preExisting");
  const balanceAtStart = formData.get("balanceAtStart");
  const openingDate = formData.get("openingDate");

  invariant(typeof name === "string", "name not found");
  invariant(typeof type === "string", "type not found");
  invariant(
    !assetClassId || typeof assetClassId === "string",
    "assetClassId not found"
  );
  invariant(typeof groupId === "string", "groupId not found");
  invariant(typeof unit === "string", "unit not found");
  invariant(!currency || typeof currency === "string", "currency not found");
  invariant(!stockId || typeof stockId === "string", "stockId not found");
  invariant(
    preExisting === "off" || preExisting === "on",
    "preExisting not found"
  );
  invariant(
    !balanceAtStart || typeof balanceAtStart === "string",
    "balanceAtStart not found"
  );
  invariant(
    !openingDate || typeof openingDate === "string",
    "openingDate not found"
  );

  return {
    name,
    type,
    assetClassId,
    groupId,
    unit,
    currency,
    stockId,
    preExisting,
    balanceAtStart,
    openingDate,
  };
}

export function getAccountListItems({ userId }: { userId: User["id"] }) {
  return prisma.account.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAccountListItemsWithCurrentBalance({
  userId,
}: {
  userId: User["id"];
}) {
  const accountItems = await prisma.account.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      group: { select: { name: true } },
      type: true,
      assetClass: { select: { name: true } },
      unit: true,
      currency: true,
      stock: { select: { symbol: true } },
      preExisting: true,
      balanceAtStart: true,
      openingDate: true,
      bookings: {
        select: {
          transaction: { select: { date: true } },
          amount: true,
          type: true,
        },
        orderBy: { transaction: { date: "desc" } },
        where: {
          transaction: { date: { lte: dayjs.utc().startOf("day").toDate() } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  const currencies = accountItems
    .filter((accountItem) => accountItem.unit === AccountUnit.CURRENCY)
    .map((account) => account.currency!);
  const rates = await fetchRates(currencies);

  return accountItems.map((accountItem) => {
    const currentBalance = (
      accountItem.preExisting ? accountItem.balanceAtStart! : new Decimal(0)
    ).plus(sum(accountItem.bookings.map(getBookingValue)));
    return {
      ...accountItem,
      currentBalance,
      currentBalanceInRefCurrency:
        accountItem.unit === AccountUnit.CURRENCY &&
        accountItem.currency !== refCurrency
          ? currentBalance.mul(rates.get(accountItem.currency!)!)
          : currentBalance,
    };
  });

  function getBookingValue(b: { type: BookingType; amount: Decimal }) {
    switch (b.type) {
      case BookingType.CHARGE:
        return b.amount.negated();
      case BookingType.DEPOSIT:
        return b.amount;
      default:
        throw new Error(
          `Booking type not supported in this context: ${b.type}`
        );
    }
  }
}

const refCurrency = "CHF"; // TODO make ref currency configurable
async function fetchRates(currencies: string[]) {
  currencies = uniq(currencies.concat(refCurrency));
  console.log(`fetching rates for ${currencies.join(", ")}`);

  const response = await fetch(
    `http://api.currencylayer.com/live?access_key=${
      process.env.CURRENCYLAYER_API_KEY
    }&currencies=${currencies.join(",")}`
  );
  if (!response.ok) throw new Error("Could not fetch rates");
  const rates = new Map<string, number>(
    Object.entries((await response.json()).quotes).map(([key, value]) => [
      key.substring(3, 6),
      value as number,
    ])
  );

  const refCurrencyRate = new Decimal(rates.get(refCurrency)!);
  rates.delete(refCurrency);

  return new Map(
    Array.from(rates).map(([currency, rate]) => [
      currency,
      refCurrencyRate.dividedBy(rate),
    ])
  );
}

function uniq<T>(array: T[]) {
  return [...new Set(array)];
}

export function getAccount({
  id,
  userId,
}: Pick<Account, "id"> & {
  userId: User["id"];
}) {
  return prisma.account.findUnique({
    where: { id_userId: { id, userId } },
    select: {
      id: true,
      name: true,
      groupId: true,
      type: true,
      assetClassId: true,
      unit: true,
      currency: true,
      stockId: true,
      stock: { select: { symbol: true } },
      preExisting: true,
      balanceAtStart: true,
      openingDate: true,
    },
  });
}

export function createAccount({
  name,
  type,
  assetClassId,
  groupId,
  unit,
  currency,
  stockId,
  preExisting,
  balanceAtStart,
  openingDate,
  userId,
}: Pick<
  Account,
  | "name"
  | "type"
  | "assetClassId"
  | "groupId"
  | "unit"
  | "currency"
  | "stockId"
  | "preExisting"
  | "balanceAtStart"
  | "openingDate"
> & {
  userId: User["id"];
}) {
  return prisma.account.create({
    data: {
      name,
      type,
      assetClass: assetClassId
        ? { connect: { id_userId: { id: assetClassId, userId } } }
        : undefined,
      group: groupId
        ? { connect: { id_userId: { id: groupId, userId } } }
        : undefined,
      unit,
      currency,
      stock: stockId
        ? { connect: { id_userId: { id: stockId, userId } } }
        : undefined,
      preExisting,
      balanceAtStart,
      openingDate,
      user: { connect: { id: userId } },
    },
  });
}

export async function updateAccount({
  id,
  name,
  type,
  assetClassId,
  groupId,
  unit,
  currency,
  stockId,
  preExisting,
  balanceAtStart,
  openingDate,
  userId,
}: Pick<
  Account,
  | "id"
  | "name"
  | "type"
  | "assetClassId"
  | "groupId"
  | "unit"
  | "currency"
  | "stockId"
  | "preExisting"
  | "balanceAtStart"
  | "openingDate"
> & {
  userId: User["id"];
}) {
  return await prisma.account.update({
    where: { id_userId: { id, userId } },
    data: {
      name,
      type,
      assetClass: assetClassId
        ? { connect: { id_userId: { id: assetClassId, userId } } }
        : undefined,
      group: groupId
        ? { connect: { id_userId: { id: groupId, userId } } }
        : undefined,
      unit,
      currency,
      stock: stockId
        ? { connect: { id_userId: { id: stockId, userId } } }
        : undefined,
      preExisting,
      balanceAtStart,
      openingDate,
    },
  });
}

export type AccountValues = {
  name: string;
  type: string;
  assetClassId: string | null;
  groupId: string;
  unit: string;
  currency: string | null;
  stockId: string | null;
  preExisting: "on" | "off";
  balanceAtStart: string | null;
  openingDate: string | null;
};

export function validateAccount({
  name,
  type,
  assetClassId,
  unit,
  currency,
  stockId,
  preExisting,
  balanceAtStart,
  openingDate,
}: AccountValues) {
  const errors: FormErrors<AccountValues> = {};

  if (name.length === 0) {
    errors.name = "Name is required";
  }

  if (type.length === 0) {
    errors.type = "Type is required";
  }

  if (type === AccountType.ASSET && !assetClassId) {
    errors.assetClassId = "Asset class is required";
  }

  if (unit.length === 0) {
    errors.type = "Unit is required";
  }

  if (unit === AccountUnit.CURRENCY && !currency) {
    errors.currency = "Currency is required";
  }

  if (unit === AccountUnit.STOCK && !stockId) {
    errors.stockId = "Stock is required";
  }

  if (preExisting === "on") {
    if (!balanceAtStart) {
      errors.balanceAtStart = "Balance at start is required";
    } else if (!isValidDecimal(balanceAtStart)) {
      errors.balanceAtStart = "Balance at start must be a number";
    }
  } else {
    if (!openingDate) {
      errors.openingDate = "Opening date is required";
    } else if (!isValidDate(openingDate)) {
      errors.openingDate = "Opening date must be a date";
    }
  }

  return errors;
}

export function deleteAccount({ id, userId }: Pick<Account, "id" | "userId">) {
  return prisma.account.delete({ where: { id_userId: { id, userId } } });
}
