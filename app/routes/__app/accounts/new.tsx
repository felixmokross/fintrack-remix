import type { AccountType } from "@prisma/client";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import { useRef } from "react";
import { PlusIcon } from "~/icons";
import { createAccount } from "~/models/account.server";
import { requireUserId } from "~/session.server";
import { AccountTypeRadioGroup, Input } from "~/shared/forms";
import { Modal } from "~/shared/modal";

type ActionData = {
  errors?: {
    name?: string;
    accountType?: string;
  };
  values?: {
    name: string;
    accountType: AccountType;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");

  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>(
      { errors: { name: "Name is required" } },
      { status: 400 }
    );
  }

  await createAccount({ name, userId });

  return redirect(`/accounts`);
};

export default function NewPage() {
  const submitButtonRef = useRef(null); // TODO do not focus submit button but first input (for all form modals)
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  return (
    <Modal initialFocus={submitButtonRef} onClose={onClose}>
      <Form method="post">
        <Modal.Body title="New Account" icon={PlusIcon}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <Input
              label="Name"
              name="name"
              id="name"
              error={actionData?.errors?.name}
              groupClassName="sm:col-span-4"
              defaultValue={actionData?.values?.name}
            />
            <AccountTypeRadioGroup
              label="Account type"
              name="accountType"
              id="accountType"
              error={actionData?.errors?.accountType}
              groupClassName="sm:col-span-2"
              defaultValue={actionData?.values?.accountType}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Button type="submit" variant="primary" ref={submitButtonRef}>
            Save
          </Modal.Button>
          <Modal.Button
            type="button"
            onClick={onClose}
            className="mt-3 sm:mt-0"
          >
            Cancel
          </Modal.Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );

  function onClose() {
    navigate(-1);
  }
}
