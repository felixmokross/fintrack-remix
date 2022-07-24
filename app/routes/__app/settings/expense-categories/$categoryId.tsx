import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useTransition,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useRef } from "react";
import invariant from "tiny-invariant";
import { PencilIcon } from "~/icons";
import type {
  IncomeExpenseCategoryErrors,
  IncomeExpenseCategoryValues,
} from "~/models/income-expense-categories.server";
import {
  getIncomeExpenseCategory,
  updateIncomeExpenseCategory,
  validateIncomeExpenseCategory,
} from "~/models/income-expense-categories.server";
import { requireUserId } from "~/session.server";
import { Input } from "~/shared/forms";
import { Modal } from "~/shared/modal";

type ActionData = {
  errors?: IncomeExpenseCategoryErrors;
  values?: IncomeExpenseCategoryValues;
};

type LoaderData = {
  category: NonNullable<Awaited<ReturnType<typeof getIncomeExpenseCategory>>>;
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  invariant(params.categoryId, "categoryId not found");

  const formData = await request.formData();
  const name = formData.get("name");

  invariant(typeof name === "string", "name not found");

  const errors = validateIncomeExpenseCategory({ name });

  if (Object.values(errors).length > 0) {
    return json<ActionData>({ errors, values: { name } }, { status: 400 });
  }

  await updateIncomeExpenseCategory({
    id: params.categoryId,
    name,
    userId,
  });

  return redirect(`/settings/expense-categories`);
};

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
  return json<LoaderData>({ category });
};

export default function EditPage() {
  const { category } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const nameInputRef = useRef(null);
  const navigate = useNavigate();
  const { state } = useTransition();
  const disabled = state !== "idle";
  return (
    <Modal initialFocus={nameInputRef} onClose={onClose}>
      <Form method="post" replace>
        <fieldset disabled={disabled}>
          <Modal.Body title="Edit Expense Category" icon={PencilIcon}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <Input
                label="Name"
                name="name"
                error={actionData?.errors?.name}
                defaultValue={actionData?.values?.name || category.name}
                groupClassName="sm:col-span-6"
                ref={nameInputRef}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Button type="submit" variant="primary">
              {state !== "idle" ? "Saving…" : "Save"}
            </Modal.Button>
            <Modal.Button
              type="button"
              onClick={onClose}
              className="mt-3 sm:mt-0"
            >
              Cancel
            </Modal.Button>
          </Modal.Footer>
        </fieldset>
      </Form>
    </Modal>
  );

  function onClose() {
    navigate(-1);
  }
}
