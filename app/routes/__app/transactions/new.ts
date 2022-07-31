import type { BookingType } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getAccountListItems } from "~/models/account.server";
import { getIncomeExpenseCategoryListItems } from "~/models/income-expense-category.server";
import {
  createTransaction,
  getTransactionValues,
  validateTransaction,
} from "~/models/transaction.server";
import { requireUserId } from "~/session.server";
import type {
  TransactionFormActionData,
  TransactionFormLoaderData,
} from "~/components/transactions";
import { hasErrors, parseDate, parseDecimal } from "~/utils.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  return json<TransactionFormLoaderData>({
    accounts: await getAccountListItems({ userId }),
    incomeExpenseCategories: await getIncomeExpenseCategoryListItems({
      userId,
    }),
  });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const values = await getTransactionValues(request);
  const errors = validateTransaction(values);

  if (hasErrors(errors)) {
    return json<TransactionFormActionData>(
      { ok: false, errors, values },
      { status: 400 }
    );
  }

  await createTransaction({
    date: parseDate(values.date),
    note: values.note || null,
    bookings: values.bookings.map(
      ({ type, accountId, categoryId, currency, note, amount }) => ({
        type: type as BookingType,
        accountId,
        incomeExpenseCategoryId: categoryId,
        currency,
        note,
        amount: parseDecimal(amount),
      })
    ),
    userId,
  });

  return json({ ok: true });
};
