import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import {
  getIncomeExpenseCategory,
  updateIncomeExpenseCategory,
  validateIncomeExpenseCategory,
} from "~/models/income-expense-categories.server";
import { requireUserId } from "~/session.server";
import type {
  IncomeCategoryFormActionData,
  IncomeCategoryFormLoaderData,
} from "~/components/income-categories";
import { hasErrors } from "~/utils.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.categoryId, "categoryId not found");
  const category = await getIncomeExpenseCategory({
    userId,
    id: params.categoryId,
  });
  if (!category) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<IncomeCategoryFormLoaderData>({ category });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  invariant(params.categoryId, "categoryId not found");

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

  await updateIncomeExpenseCategory({
    id: params.categoryId,
    name,
    userId,
  });

  return json<IncomeCategoryFormActionData>({ ok: true });
};
