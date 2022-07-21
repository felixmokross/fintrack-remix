import { Form, useActionData, useNavigate } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { useRef } from "react";
import invariant from "tiny-invariant";
import { PlusIcon } from "~/icons";
import type {
  AssetClassErrors,
  AssetClassValues,
} from "~/models/asset-class.server";
import {
  parseSortOrder,
  validateAssetClass,
} from "~/models/asset-class.server";
import { createAssetClass } from "~/models/asset-class.server";
import { requireUserId } from "~/session.server";
import { Input } from "~/shared/forms";
import { Modal } from "~/shared/modal";

type ActionData = {
  errors?: AssetClassErrors;
  values?: AssetClassValues;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const sortOrder = formData.get("sortOrder");

  invariant(typeof name === "string", "name not found");
  invariant(typeof sortOrder === "string", "sortOrder not found");

  const errors = validateAssetClass({ name, sortOrder });

  if (Object.values(errors).length > 0) {
    return json<ActionData>(
      { errors, values: { name, sortOrder } },
      { status: 400 }
    );
  }

  await createAssetClass({
    name,
    sortOrder: parseSortOrder(sortOrder),
    userId,
  });

  return redirect(`/asset-classes`);
};

export default function NewAssetClassModal() {
  const submitButtonRef = useRef(null);
  const navigate = useNavigate();
  const actionData = useActionData<ActionData>();
  return (
    <Modal initialFocus={submitButtonRef} onClose={onClose}>
      <Form method="post" replace={true}>
        <Modal.Body title="New Asset Class" icon={PlusIcon}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <Input
              label="Name"
              name="name"
              id="name"
              error={actionData?.errors?.name}
              groupClassName="sm:col-span-3"
            />
            <Input
              label="Sort order"
              name="sortOrder"
              id="sortOrder"
              error={actionData?.errors?.sortOrder}
              groupClassName="sm:col-span-3"
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
