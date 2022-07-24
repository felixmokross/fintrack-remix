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
  AccountGroupErrors,
  AccountGroupValues,
} from "~/models/account-group.server";
import {
  createAccountGroup,
  validateAccountGroup,
} from "~/models/account-group.server";
import { requireUserId } from "~/session.server";
import { Input } from "~/shared/forms";
import { Modal } from "~/shared/modal";

type ActionData = {
  errors?: AccountGroupErrors;
  values?: AccountGroupValues;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");

  invariant(typeof name === "string", "name not found");

  const errors = validateAccountGroup({ name });

  if (Object.values(errors).length > 0) {
    return json<ActionData>({ errors, values: { name } }, { status: 400 });
  }

  await createAccountGroup({ name, userId });

  return redirect(`/settings/account-groups`);
};

export default function NewAccountGroupModal() {
  const nameInputRef = useRef(null);
  const navigate = useNavigate();
  const actionData = useActionData<ActionData>();
  const { state } = useTransition();
  const disabled = state !== "idle";
  return (
    <Modal initialFocus={nameInputRef} onClose={onClose}>
      <Form method="post" replace>
        <fieldset disabled={disabled}>
          <Modal.Body title="New Account Group" icon={PlusIcon}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <Input
                label="Name"
                name="name"
                error={actionData?.errors?.name}
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
