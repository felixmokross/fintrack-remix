import { AccountUnit } from "@prisma/client";
import { AccountType } from "@prisma/client";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useTransition,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import { useState } from "react";
import invariant from "tiny-invariant";
import { PlusIcon } from "~/icons";
import { getAccountGroupListItems } from "~/models/account-group.server";
import type { AccountErrors, AccountValues } from "~/models/account.server";
import { validateAccount } from "~/models/account.server";
import { createAccount } from "~/models/account.server";
import { getAssetClassListItems } from "~/models/asset-class.server";
import { getStockListItems } from "~/models/stock.server";
import { requireUserId } from "~/session.server";
import {
  AccountTypeRadioGroup,
  AccountUnitRadioGroup,
} from "~/shared/accounts";
import {
  CurrencyCombobox,
  DetailedRadioGroup,
  Input,
  Select,
} from "~/shared/forms";
import { Modal, ModalSize } from "~/shared/modal";
import { parseDate, parseDecimal } from "~/shared/util";

type LoaderData = {
  assetClasses: Awaited<ReturnType<typeof getAssetClassListItems>>;
  accountGroups: Awaited<ReturnType<typeof getAccountGroupListItems>>;
  stocks: Awaited<ReturnType<typeof getStockListItems>>;
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
    stocks: await getStockListItems({ userId }),
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
  const currency = formData.get("currency");
  const stockId = formData.get("stockId");
  const preExisting = formData.get("preExisting");
  const balanceAtStart = formData.get("balanceAtStart");
  const openingDate = formData.get("openingDate");

  invariant(typeof name === "string", "name not found");
  invariant(typeof type === "string", "type not found");
  invariant(
    !assetClassId || typeof assetClassId === "string",
    "assetClassId not found"
  );
  invariant(typeof groupId === "string", "groupId not found");
  invariant(typeof unit === "string", "unit not found");
  invariant(!currency || typeof currency === "string", "currency not found");
  invariant(!stockId || typeof stockId === "string", "stockId not found");
  invariant(
    preExisting === "off" || preExisting === "on",
    "preExisting not found"
  );
  invariant(
    !balanceAtStart || typeof balanceAtStart === "string",
    "balanceAtStart not found"
  );
  invariant(
    !openingDate || typeof openingDate === "string",
    "openingDate not found"
  );

  const errors = validateAccount({
    name,
    type,
    assetClassId,
    groupId,
    unit,
    currency,
    stockId,
    preExisting,
    balanceAtStart,
    openingDate,
  });
  if (Object.values(errors).length > 0) {
    return json<ActionData>(
      {
        errors,
        values: {
          name,
          type,
          assetClassId,
          groupId,
          unit,
          currency,
          stockId,
          preExisting,
          balanceAtStart,
          openingDate,
        },
      },
      { status: 400 }
    );
  }

  await createAccount({
    name,
    type: type as AccountType,
    assetClassId,
    groupId,
    unit: unit as AccountUnit,
    currency,
    stockId,
    userId,
    preExisting: preExisting === "on",
    balanceAtStart: balanceAtStart ? parseDecimal(balanceAtStart) : null,
    openingDate: openingDate ? parseDate(openingDate) : null,
  });

  return redirect(`/accounts`);
};

export default function NewPage() {
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  const { assetClasses, accountGroups, stocks } = useLoaderData<LoaderData>();
  const [type, setType] = useState<AccountType>(
    (actionData?.values?.type as AccountType) || AccountType.ASSET
  );
  const [unit, setUnit] = useState<AccountUnit>(
    (actionData?.values?.unit as AccountUnit) || AccountUnit.CURRENCY
  );
  const [preExisting, setPreExisting] = useState(
    actionData?.values?.preExisting === "on" || false
  );
  const { state } = useTransition();
  const disabled = state !== "idle";
  return (
    <Modal onClose={onClose} size={ModalSize.LARGE}>
      <Form method="post" replace>
        <fieldset disabled={disabled}>
          <Modal.Body title="New Account" icon={PlusIcon}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <Input
                label="Name"
                name="name"
                error={actionData?.errors?.name}
                groupClassName="sm:col-span-3"
                defaultValue={actionData?.values?.name}
              />
              <Select
                label="Group"
                name="groupId"
                error={actionData?.errors?.groupId}
                groupClassName="sm:col-span-3"
                defaultValue={actionData?.values?.groupId}
              >
                <option value="">[None]</option>
                <option disabled>───────────────</option>
                {accountGroups.map((accountGroup) => (
                  <option key={accountGroup.id} value={accountGroup.id}>
                    {accountGroup.name}
                  </option>
                ))}
              </Select>
              <AccountTypeRadioGroup
                label="Type"
                name="type"
                error={actionData?.errors?.type}
                groupClassName="sm:col-span-3"
                defaultValue={actionData?.values?.type}
                onChange={setType}
                disabled={disabled}
              />
              {type === AccountType.ASSET && (
                <Select
                  label="Asset class"
                  name="assetClassId"
                  error={actionData?.errors?.assetClassId}
                  groupClassName="sm:col-span-3"
                  defaultValue={actionData?.values?.assetClassId || undefined}
                >
                  {assetClasses.map((assetClass) => (
                    <option key={assetClass.id} value={assetClass.id}>
                      {assetClass.name}
                    </option>
                  ))}
                </Select>
              )}
              <AccountUnitRadioGroup
                label="Unit"
                name="unit"
                error={actionData?.errors?.unit}
                groupClassName="sm:col-span-3 sm:col-start-1"
                defaultValue={actionData?.values?.unit}
                onChange={setUnit}
                disabled={disabled}
              />
              {unit === AccountUnit.CURRENCY && (
                <CurrencyCombobox
                  name="currency"
                  label="Currency"
                  error={actionData?.errors?.currency}
                  defaultValue={actionData?.values?.currency || undefined} // TODO add reference currency as default
                  groupClassName="sm:col-span-3"
                />
              )}
              {unit === AccountUnit.STOCK && (
                <Select
                  label="Stock"
                  name="stockId"
                  error={actionData?.errors?.stockId}
                  groupClassName="sm:col-span-3"
                  defaultValue={actionData?.values?.stockId || undefined}
                >
                  {stocks.map((stock) => (
                    <option key={stock.id} value={stock.id}>
                      {stock.id}
                    </option>
                  ))}
                </Select>
              )}
              <DetailedRadioGroup
                groupClassName="sm:col-span-6"
                label="When was the account opened?"
                name="preExisting"
                defaultValue={actionData?.values?.preExisting || "off"}
                onChange={(value) => setPreExisting(value === "on")}
                disabled={disabled}
                options={[
                  {
                    label: "Before accounting start",
                    value: "on",
                    description:
                      "This is a pre-existing account. It has a balance on the day before the accounting start date.",
                  },
                  {
                    label: "After accounting start",
                    value: "off",
                    description:
                      "The account was opened on or after the accounting start date.",
                  },
                ]}
              />
              {preExisting ? (
                <Input
                  key="balanceAtStart"
                  groupClassName="sm:col-span-3"
                  label="Balance at start"
                  name="balanceAtStart"
                  defaultValue={actionData?.values?.balanceAtStart || undefined}
                  error={actionData?.errors?.balanceAtStart}
                />
              ) : (
                <Input
                  key="openingDate"
                  groupClassName="sm:col-span-3"
                  label="Opening date"
                  name="openingDate"
                  type="date"
                  defaultValue={actionData?.values?.openingDate || undefined}
                  error={actionData?.errors?.openingDate}
                />
              )}
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
