import type { BookingType } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { PencilIcon } from "~/icons";
import { getAccountListItems } from "~/models/account.server";
import { getIncomeExpenseCategoryListItems } from "~/models/income-expense-category.server";
import type { BookingValues } from "~/models/transaction.server";
import { updateTransaction } from "~/models/transaction.server";
import { getTransaction } from "~/models/transaction.server";
import { validateTransaction } from "~/models/transaction.server";
import { requireUserId } from "~/session.server";
import type { ActionData, LoaderData } from "~/shared/transactions";
import { TransactionFormModal } from "~/shared/transactions";
import { parseDate, parseDecimal } from "~/shared/util";

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

    bookings[i] = {
      type,
      accountId,
      categoryId,
      currency,
      note,
      amount,
    };
  }

  const errors = validateTransaction({ date, note, bookings });

  if (Object.values(errors).length > 0) {
    return json<ActionData>(
      { errors, values: { date, note, bookings } },
      { status: 400 }
    );
  }

  await updateTransaction({
    id: params.transactionId,
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

export default function EditTransactionModal() {
  return <TransactionFormModal title="Edit Transaction" icon={PencilIcon} />;
}
