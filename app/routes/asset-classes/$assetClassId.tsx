import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useRef } from "react";
import invariant from "tiny-invariant";
import { PencilIcon } from "~/icons";
import type {
  AssetClassErrors,
  AssetClassValues,
} from "~/models/asset-class.server";
import {
  getAssetClass,
  parseSortOrder,
  updateAssetClass,
  validateAssetClass,
} from "~/models/asset-class.server";
import { requireUserId } from "~/session.server";
import { Input } from "~/shared/forms";
import { Modal } from "~/shared/modal";

type ActionData = {
  errors?: AssetClassErrors;
  values?: AssetClassValues;
};

type LoaderData = {
  assetClass: NonNullable<Awaited<ReturnType<typeof getAssetClass>>>;
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  invariant(params.assetClassId, "assetClassId not found");

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

  await updateAssetClass({
    id: params.assetClassId,
    name,
    sortOrder: parseSortOrder(sortOrder),
    userId,
  });

  return redirect(`/asset-classes`);
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.assetClassId, "assetClassId not found");
  const assetClass = await getAssetClass({ userId, id: params.assetClassId });
  if (!assetClass) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ assetClass });
};

export default function EditPage() {
  const { assetClass } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const submitButtonRef = useRef(null);
  const navigate = useNavigate();
  return (
    <Modal initialFocus={submitButtonRef} onClose={onClose}>
      <Form method="post" replace={true}>
        <Modal.Body title="Edit Asset Class" icon={PencilIcon}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <Input
              label="Name"
              name="name"
              id="name"
              error={actionData?.errors?.name}
              defaultValue={actionData?.values?.name || assetClass.name}
              groupClassName="sm:col-span-3"
            />
            <Input
              label="Sort order"
              name="sortOrder"
              id="sortOrder"
              error={actionData?.errors?.sortOrder}
              defaultValue={
                actionData?.values?.sortOrder || assetClass.sortOrder
              }
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
