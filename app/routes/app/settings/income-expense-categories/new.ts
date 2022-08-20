import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import {
  createIncomeExpenseCategory,
  validateIncomeExpenseCategory,
} from "~/models/income-expense-categories.server";
import { requireUserId } from "~/session.server";
import type { IncomeExpenseCategoryFormActionData } from "~/components/income-expense-categories";
import { hasErrors } from "~/utils.server";
import type { IncomeExpenseCategoryType } from "@prisma/client";

export const loader: LoaderFunction = async () => ({});

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const type = formData.get("type");

  invariant(typeof name === "string", "name not found");
  invariant(typeof type === "string", "type not found");

  const errors = validateIncomeExpenseCategory({ name });

  if (hasErrors(errors)) {
    return json<IncomeExpenseCategoryFormActionData>(
      { ok: false, errors, values: { name } },
      { status: 400 }
    );
  }

  await createIncomeExpenseCategory({
    name,
    type: type as IncomeExpenseCategoryType,
    userId,
  });

  return json<IncomeExpenseCategoryFormActionData>({ ok: true });
};
