import { AssetClass } from "@prisma/client";
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
import { getAssetClass, updateAssetClass } from "~/models/asset-class.server";
import { requireUserId } from "~/session.server";
import { Modal } from "~/shared/modal";

type ActionData = {
  errors?: {
    name?: string;
    sortOrder?: string;
  };
  values?: {
    name: string;
    sortOrder: string;
  };
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

  const errors: ActionData["errors"] = {};

  if (name.length === 0) {
    errors.name = "Name is required";
  }

  const parsedSortOrder = parseInt(sortOrder, 10);
  if (sortOrder.length === 0) {
    errors.sortOrder = "Sort order is required";
  } else if (isNaN(parsedSortOrder)) {
    errors.sortOrder = "Sort order must be a number";
  }

  if (Object.values(errors).length > 0) {
    return json<ActionData>(
      { errors, values: { name, sortOrder } },
      { status: 400 }
    );
  }

  await updateAssetClass({
    id: params.assetClassId,
    name,
    sortOrder: parsedSortOrder,
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
      <Form method="post">
        <Modal.Body title="Edit Asset Class" icon={PencilIcon}>
          <div className="space-y-8 divide-y divide-gray-200">
            <div className="space-y-8 divide-y divide-gray-200">
              <div>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        defaultValue={
                          actionData?.values?.name || assetClass.name
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        aria-invalid={
                          actionData?.errors?.name ? "true" : undefined
                        }
                        aria-describedby={
                          actionData?.errors?.name ? "name-error" : undefined
                        }
                      />

                      {actionData?.errors?.name && (
                        <p
                          className="mt-2 text-sm text-red-600"
                          id="name-error"
                        >
                          {actionData.errors.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="sortOrder"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Sort Order
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="sortOrder"
                        id="sortOrder"
                        defaultValue={
                          actionData?.values?.sortOrder || assetClass.sortOrder
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        aria-invalid={
                          actionData?.errors?.sortOrder ? "true" : undefined
                        }
                        aria-describedby={
                          actionData?.errors?.sortOrder
                            ? "sortOrder-error"
                            : undefined
                        }
                      />

                      {actionData?.errors?.sortOrder && (
                        <p
                          className="mt-2 text-sm text-red-600"
                          id="sortOrder-error"
                        >
                          {actionData.errors?.sortOrder}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
