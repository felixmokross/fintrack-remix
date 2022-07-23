import { AccountType } from "@prisma/client";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import { useRef } from "react";
import invariant from "tiny-invariant";
import { PlusIcon } from "~/icons";
import type { AccountErrors, AccountValues } from "~/models/account.server";
import { validateAccount } from "~/models/account.server";
import { createAccount } from "~/models/account.server";
import { getAssetClassListItems } from "~/models/asset-class.server";
import { requireUserId } from "~/session.server";
import { AccountTypeRadioGroup, Input, Select } from "~/shared/forms";
import { Modal } from "~/shared/modal";

type LoaderData = {
  assetClasses: Awaited<ReturnType<typeof getAssetClassListItems>>;
};

type ActionData = {
  errors?: AccountErrors;
  values?: AccountValues;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  return json<LoaderData>({
    assetClasses: await getAssetClassListItems({ userId }),
  });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const accountType = formData.get("accountType");
  const assetClassId = formData.get("assetClassId");

  invariant(typeof name === "string", "name not found");
  invariant(typeof accountType === "string", "accountType not found");
  invariant(
    !assetClassId || typeof assetClassId === "string",
    "assetClassId not found"
  );

  const errors = validateAccount({ name, accountType, assetClassId });
  if (Object.values(errors).length > 0) {
    return json<ActionData>(
      { errors, values: { name, accountType, assetClassId } },
      { status: 400 }
    );
  }

  await createAccount({ name, userId });

  return redirect(`/accounts`);
};

export default function NewPage() {
  const nameInputRef = useRef(null);
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  const { assetClasses } = useLoaderData<LoaderData>();
  const assetClassSelectRef = useRef<HTMLSelectElement>(null);
  return (
    <Modal initialFocus={nameInputRef} onClose={onClose}>
      <Form method="post" replace>
        <Modal.Body title="New Account" icon={PlusIcon}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <Input
              label="Name"
              name="name"
              id="name"
              error={actionData?.errors?.name}
              groupClassName="sm:col-span-4"
              defaultValue={actionData?.values?.name}
              ref={nameInputRef}
            />
            <AccountTypeRadioGroup
              label="Account type"
              name="accountType"
              id="accountType"
              error={actionData?.errors?.accountType}
              groupClassName="sm:col-span-2"
              defaultValue={actionData?.values?.accountType}
              onChange={(accountType) => {
                if (accountType === AccountType.ASSET) {
                  assetClassSelectRef.current!.disabled = false;
                } else {
                  assetClassSelectRef.current!.value = "";
                  assetClassSelectRef.current!.disabled = true;
                }
              }}
            />
            <Select
              label="Asset class"
              name="assetClassId"
              id="assetClassId"
              error={actionData?.errors?.assetClassId}
              groupClassName="sm:col-span-3"
              defaultValue={actionData?.values?.assetClassId || undefined}
              ref={assetClassSelectRef}
            >
              <option value=""></option>
              {assetClasses.map((assetClass) => (
                <option key={assetClass.id} value={assetClass.id}>
                  {assetClass.name}
                </option>
              ))}
            </Select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Button type="submit" variant="primary">
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
