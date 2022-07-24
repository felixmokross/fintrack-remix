import {
  Form,
  useActionData,
  useNavigate,
  useTransition,
} from "@remix-run/react";
import type { ActionFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import { useRef } from "react";
import invariant from "tiny-invariant";
import { PlusIcon } from "~/icons";
import type {
  TransactionErrors,
  TransactionValues,
} from "~/models/transaction.server";
import {
  createTransaction,
  validateTransaction,
} from "~/models/transaction.server";
import { requireUserId } from "~/session.server";
import { Input } from "~/shared/forms";
import { Modal } from "~/shared/modal";
import { parseDate } from "~/shared/util";

type ActionData = {
  errors?: TransactionErrors;
  values?: TransactionValues;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const date = formData.get("date");
  const note = formData.get("note");

  invariant(typeof date === "string", "date not found");
  invariant(typeof note === "string", "note not found");

  const errors = validateTransaction({ date, note });

  if (Object.values(errors).length > 0) {
    return json<ActionData>(
      { errors, values: { date, note } },
      { status: 400 }
    );
  }

  await createTransaction({ date: parseDate(date), note, userId });

  return redirect(`/transactions`);
};

export default function NewTransactionModal() {
  const dateInputRef = useRef(null);
  const navigate = useNavigate();
  const actionData = useActionData<ActionData>();
  const { state } = useTransition();
  const disabled = state !== "idle";
  return (
    <Modal initialFocus={dateInputRef} onClose={onClose}>
      <Form method="post" replace>
        <fieldset disabled={disabled}>
          <Modal.Body title="New Transaction" icon={PlusIcon}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <Input
                label="Date"
                name="date"
                type="date"
                error={actionData?.errors?.date}
                groupClassName="sm:col-span-2"
                ref={dateInputRef}
              />
              <Input
                label="Note (optional)"
                name="note"
                error={actionData?.errors?.note}
                groupClassName="sm:col-span-4"
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
