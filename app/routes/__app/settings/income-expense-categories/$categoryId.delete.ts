import type { ActionFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { deleteIncomeExpenseCategory } from "~/models/income-expense-categories.server";
import { requireUserId } from "~/session.server";

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.categoryId, "categoryId not found");

  await deleteIncomeExpenseCategory({ id: params.categoryId, userId });

  return new Response(undefined, { status: 204 });
};
