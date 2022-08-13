import type {
  Account,
  AssetClass,
  Booking,
  IncomeExpenseCategory,
  Stock,
  Transaction,
} from "@prisma/client";
import { AccountUnit } from "@prisma/client";
import { IncomeExpenseCategoryType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import cuid from "cuid";
import { Button } from "~/components/button";
import { Input } from "~/components/forms";
import { CheckCircleIcon } from "~/components/icons";
import { prisma } from "~/db.server";
import type {
  AccountCategory as ImportAccountCategory,
  Stock as ImportStock,
  IncomeCategory as ImportIncomeCategory,
  ExpenseCategory as ImportExpenseCategory,
  Account as ImportAccount,
  Transaction as ImportTransaction,
} from "~/import/types";
import {
  BookingType as ImportBookingType,
  AccountUnitKind as ImportAccountUnitKind,
} from "~/import/types";
import { getDb } from "~/mongodb.server";
import { getSession, requireUserId, sessionStorage } from "~/session.server";

type ActionData = {
  error?: string;
};

type LoaderData = {
  message?: string;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const form = await request.formData();
  const importKey = form.get("importKey");
  if (!importKey) {
    return json({ error: "No import key provided" }, { status: 400 });
  }

  if (importKey !== process.env.IMPORT_KEY) {
    return json({ error: "Incorrect import key" }, { status: 403 });
  }

  const db = await getDb();
  const assetClassesByImportId = new Map(
    (
      await db
        .collection<ImportAccountCategory>("accountCategories")
        .find()
        .toArray()
    ).map<[string, Omit<AssetClass, "createdAt" | "updatedAt">]>((ac) => [
      ac._id.toHexString(),
      {
        id: cuid(),
        name: ac.name,
        sortOrder: ac.order,
        userId,
      },
    ])
  );
  const assetClasses = Array.from(assetClassesByImportId.values());

  const stocksByImportId = new Map(
    (await db.collection<ImportStock>("stocks").find().toArray()).map<
      [string, Omit<Stock, "createdAt" | "updatedAt">]
    >((s) => [
      s._id.toHexString(),
      {
        id: cuid(),
        symbol: s.symbol,
        tradingCurrency: s.tradingCurrency,
        userId,
      },
    ])
  );

  const stocks = Array.from(stocksByImportId.values());

  const incomeCategoriesByImportId = new Map(
    (
      await db
        .collection<ImportIncomeCategory>("incomeCategories")
        .find()
        .toArray()
    ).map<[string, Omit<IncomeExpenseCategory, "createdAt" | "updatedAt">]>(
      (c) => [
        c._id.toHexString(),
        {
          id: cuid(),
          name: c.name,
          type: IncomeExpenseCategoryType.INCOME,
          userId,
        },
      ]
    )
  );

  const incomeCategories = Array.from(incomeCategoriesByImportId.values());

  const expenseCategoriesByImportId = new Map(
    (
      await db
        .collection<ImportExpenseCategory>("expenseCategories")
        .find()
        .toArray()
    ).map<[string, Omit<IncomeExpenseCategory, "createdAt" | "updatedAt">]>(
      (c) => [
        c._id.toHexString(),
        {
          id: cuid(),
          name: c.name,
          type: IncomeExpenseCategoryType.EXPENSE,
          userId,
        },
      ]
    )
  );

  const expenseCategories = Array.from(expenseCategoriesByImportId.values());

  const accountsByImportId = new Map(
    (await db.collection<ImportAccount>("accounts").find().toArray())
      .map<[string, Omit<Account, "createdAt" | "updatedAt">]>((a) => [
        a._id.toHexString(),
        {
          id: cuid(),
          name: a.name,
          type: a.categoryType,
          assetClassId: assetClassesByImportId.get(a.categoryId.toHexString())!
            .id,
          unit: a.unit.kind,
          groupId: null,
          currency:
            a.unit.kind === ImportAccountUnitKind.CURRENCY
              ? a.unit.currency
              : null,
          stockId:
            a.unit.kind === ImportAccountUnitKind.STOCK
              ? stocksByImportId.get(a.unit.stockId.toHexString())!.id
              : null,
          preExisting: !a.openingDate,
          balanceAtStart: a.openingBalance
            ? new Decimal(a.openingBalance.toString())
            : null,
          openingDate: a.openingDate || null,
          closingDate: a.closingDate || null,
          isActive: a.isActive,
          userId,
        },
      ])
      .filter(
        ([, a]) =>
          a.unit !== AccountUnit.CURRENCY ||
          !["ETH", "BTC", "ADA", "BCH"].includes(a.currency!)
      )
  );
  const accounts = Array.from(accountsByImportId.values());

  const importTransactions = await db
    .collection<ImportTransaction>("transactions")
    .find()
    .toArray();

  const transactionsByImportId = new Map(
    importTransactions.map<
      [string, Omit<Transaction, "createdAt" | "updatedAt" | "bookings">]
    >((t) => [
      t._id.toHexString(),
      {
        id: cuid(),
        date: t.date,
        note: t.note || null,
        userId,
      },
    ])
  );

  const transactions = Array.from(transactionsByImportId.values());

  const bookings = importTransactions
    .map<Omit<Booking, "id">[]>((t) =>
      t.bookings.map((b, index) => ({
        type: b.type,
        note:
          b.type !== ImportBookingType.APPRECIATION &&
          b.type !== ImportBookingType.DEPRECIATION
            ? b.note || null
            : null,
        accountId:
          b.type === ImportBookingType.DEPOSIT ||
          b.type === ImportBookingType.CHARGE
            ? accountsByImportId.get(b.accountId.toHexString())?.id || null
            : null,
        incomeExpenseCategoryId:
          b.type === ImportBookingType.EXPENSE
            ? expenseCategoriesByImportId.get(
                b.expenseCategoryId.toHexString()
              )!.id
            : b.type === ImportBookingType.INCOME
            ? incomeCategoriesByImportId.get(b.incomeCategoryId.toHexString())!
                .id
            : null,
        currency:
          b.type === ImportBookingType.EXPENSE ||
          b.type === ImportBookingType.INCOME
            ? b.currency
            : null,
        amount: new Decimal(b.amount.toString()),
        sortOrder: index,
        transactionId: transactionsByImportId.get(t._id.toHexString())!.id,
        userId,
      }))
    )
    .flat();

  await prisma.$transaction([
    prisma.booking.deleteMany({ where: { userId } }),
    prisma.transaction.deleteMany({ where: { userId } }),
    prisma.account.deleteMany({ where: { userId } }),
    prisma.assetClass.deleteMany({ where: { userId } }),
    prisma.stock.deleteMany({ where: { userId } }),
    prisma.incomeExpenseCategory.deleteMany({ where: { userId } }),

    prisma.incomeExpenseCategory.createMany({
      data: incomeCategories.concat(expenseCategories),
    }),
    prisma.assetClass.createMany({ data: assetClasses }),
    prisma.stock.createMany({ data: stocks }),
    prisma.account.createMany({ data: accounts }),
    prisma.transaction.createMany({ data: transactions }),
    prisma.booking.createMany({ data: bookings }),
  ]);

  const session = await getSession(request);
  session.flash(
    "flashMessage",
    `Imported successful: ${assetClasses.length} asset classes, ${stocks.length} stocks, ${incomeCategories.length} income categories, ${expenseCategories.length} expense categories, ${accounts.length} accounts, ${transactions.length} transactions, ${bookings.length} bookings`
  );

  return redirect("/settings/import", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const session = await getSession(request);
  const message = session.get("flashMessage");

  return json<LoaderData>(
    { message },
    {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    }
  );
};

export default function ImportPage() {
  const transition = useTransition();
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  return (
    <Form
      method="post"
      className="flex h-full flex-col items-center justify-center gap-4"
    >
      {loaderData.message && (
        <div className="rounded-md bg-emerald-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon
                className="h-5 w-5 text-emerald-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-emerald-800">
                {loaderData.message}
              </p>
            </div>
          </div>
        </div>
      )}
      <p className="text-sm font-medium">
        Note: all existing data will be lost!
      </p>
      <div>
        <Input
          name="importKey"
          type="password"
          label="Import key"
          groupClassName="w-80"
          error={actionData?.error}
        />
      </div>
      <Button
        variant="primary"
        type="submit"
        className="px-20 py-4 text-3xl font-light"
        disabled={transition.state === "submitting"}
      >
        Import
      </Button>
    </Form>
  );
}
