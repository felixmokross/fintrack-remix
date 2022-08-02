import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import {
  createIncomeCategory,
  validateIncomeExpenseCategory,
} from "~/models/income-expense-categories.server";
import { requireUserId } from "~/session.server";
import type { IncomeCategoryFormActionData } from "~/components/income-categories";
import { hasErrors } from "~/utils.server";

export const loader: LoaderFunction = async () => ({});

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");

  invariant(typeof name === "string", "name not found");

  const errors = validateIncomeExpenseCategory({ name });

  if (hasErrors(errors)) {
    return json<IncomeCategoryFormActionData>(
      { ok: false, errors, values: { name } },
      { status: 400 }
    );
  }

  await createIncomeCategory({ name, userId });

  return json<IncomeCategoryFormActionData>({ ok: true });
};
