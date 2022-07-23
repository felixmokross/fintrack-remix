import { AccountType, AccountUnit } from "@prisma/client";
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
import { getAccountGroupListItems } from "~/models/account-group.server";
import type { AccountErrors, AccountValues } from "~/models/account.server";
import { validateAccount } from "~/models/account.server";
import { createAccount } from "~/models/account.server";
import { getAssetClassListItems } from "~/models/asset-class.server";
import { requireUserId } from "~/session.server";
import {
  AccountTypeRadioGroup,
  AccountUnitRadioGroup,
  Input,
  Select,
} from "~/shared/forms";
import { Modal } from "~/shared/modal";

type LoaderData = {
  assetClasses: Awaited<ReturnType<typeof getAssetClassListItems>>;
  accountGroups: Awaited<ReturnType<typeof getAccountGroupListItems>>;
};

type ActionData = {
  errors?: AccountErrors;
  values?: AccountValues;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  return json<LoaderData>({
    assetClasses: await getAssetClassListItems({ userId }),
    accountGroups: await getAccountGroupListItems({ userId }),
  });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const type = formData.get("type");
  const assetClassId = formData.get("assetClassId");
  const groupId = formData.get("groupId");
  const unit = formData.get("unit");

  invariant(typeof name === "string", "name not found");
  invariant(typeof type === "string", "type not found");
  invariant(
    !assetClassId || typeof assetClassId === "string",
    "assetClassId not found"
  );
  invariant(typeof groupId === "string", "groupId not found");
  invariant(typeof unit === "string", "unit not found");

  const errors = validateAccount({ name, type, assetClassId, groupId, unit });
  if (Object.values(errors).length > 0) {
    return json<ActionData>(
      { errors, values: { name, type, assetClassId, groupId, unit } },
      { status: 400 }
    );
  }

  await createAccount({
    name,
    type: type as AccountType,
    assetClassId,
    groupId,
    unit: unit as AccountUnit,
    userId,
  });

  return redirect(`/accounts`);
};

export default function NewPage() {
  const nameInputRef = useRef(null);
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  const { assetClasses, accountGroups } = useLoaderData<LoaderData>();
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
              label="Type"
              name="type"
              id="type"
              error={actionData?.errors?.type}
              groupClassName="sm:col-span-2"
              defaultValue={actionData?.values?.type}
              onChange={(type) => {
                if (type === AccountType.ASSET) {
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
            <Select
              label="Group"
              name="groupId"
              id="groupId"
              error={actionData?.errors?.groupId}
              groupClassName="sm:col-span-3"
              defaultValue={actionData?.values?.groupId}
            >
              <option value=""></option>
              {accountGroups.map((accountGroup) => (
                <option key={accountGroup.id} value={accountGroup.id}>
                  {accountGroup.name}
                </option>
              ))}
            </Select>
            <AccountUnitRadioGroup
              label="Unit"
              name="unit"
              id="unit"
              error={actionData?.errors?.unit}
              groupClassName="sm:col-span-3"
              defaultValue={actionData?.values?.unit}
              onChange={(unit) => {
                // if (type === AccountType.ASSET) {
                //   assetClassSelectRef.current!.disabled = false;
                // } else {
                //   assetClassSelectRef.current!.value = "";
                //   assetClassSelectRef.current!.disabled = true;
                // }
              }}
            />
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
