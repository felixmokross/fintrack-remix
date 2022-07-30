import type { BookingType } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { PlusIcon } from "~/icons";
import { getAccountListItems } from "~/models/account.server";
import { getIncomeExpenseCategoryListItems } from "~/models/income-expense-category.server";
import type {
  BookingValues,
  TransactionErrors,
  TransactionValues,
} from "~/models/transaction.server";
import {
  createTransaction,
  validateTransaction,
} from "~/models/transaction.server";
import { requireUserId } from "~/session.server";
import { TransactionFormModal } from "~/shared/transactions";
import { parseDate, parseDecimal } from "~/shared/util";

type LoaderData = {
  accounts: Awaited<ReturnType<typeof getAccountListItems>>;
  incomeExpenseCategories: Awaited<
    ReturnType<typeof getIncomeExpenseCategoryListItems>
  >;
};

type ActionData = {
  errors?: TransactionErrors;
  values?: TransactionValues;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  return json<LoaderData>({
    accounts: await getAccountListItems({ userId }),
    incomeExpenseCategories: await getIncomeExpenseCategoryListItems({
      userId,
    }),
  });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

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

  const errors = validateTransaction({ date, note, bookings });

  if (Object.values(errors).length > 0) {
    return json<ActionData>(
      { errors, values: { date, note, bookings } },
      { status: 400 }
    );
  }

  await createTransaction({
    date: parseDate(date),
    note,
    bookings: bookings.map(
      ({ type, accountId, categoryId, currency, note, amount }) => ({
        type: type as BookingType,
        accountId,
        incomeExpenseCategoryId: categoryId,
        currency: currency,
        note: note,
        amount: parseDecimal(amount),
      })
    ),
    userId,
  });

  return redirect(`/transactions`);
};

export default function NewTransactionModal() {
  return <TransactionFormModal title="New Transaction" icon={PlusIcon} />;
}
