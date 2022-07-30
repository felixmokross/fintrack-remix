import type { BookingType } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { PencilIcon } from "~/components/icons";
import { getAccountListItems } from "~/models/account.server";
import { getIncomeExpenseCategoryListItems } from "~/models/income-expense-category.server";
import {
  getTransactionValues,
  updateTransaction,
} from "~/models/transaction.server";
import { getTransaction } from "~/models/transaction.server";
import { validateTransaction } from "~/models/transaction.server";
import { requireUserId } from "~/session.server";
import type { ActionData, LoaderData } from "~/components/transactions";
import { TransactionFormModal } from "~/components/transactions";
import { hasErrors, parseDate, parseDecimal } from "~/utils.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  invariant(params.transactionId, "transactionId not found");
  const transaction = await getTransaction({
    id: params.transactionId,
    userId,
  });
  if (!transaction) return new Response("Not found", { status: 404 });

  return json<LoaderData>({
    accounts: await getAccountListItems({ userId }),
    incomeExpenseCategories: await getIncomeExpenseCategoryListItems({
      userId,
    }),
    transaction,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.transactionId, "transactionId not found");

  const values = await getTransactionValues(request);
  const errors = validateTransaction(values);

  if (hasErrors(errors)) {
    return json<ActionData>({ errors, values }, { status: 400 });
  }

  await updateTransaction({
    id: params.transactionId,
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

  return redirect(`/transactions`);
};

export default function EditTransactionModal() {
  return <TransactionFormModal title="Edit Transaction" icon={PencilIcon} />;
}
