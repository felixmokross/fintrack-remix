import { AccountType, AccountUnit } from "@prisma/client";
import {
  useActionData,
  useNavigate,
  useLoaderData,
  Form,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { useRef, useState } from "react";
import invariant from "tiny-invariant";
import { PencilIcon } from "~/icons";
import { getAccountGroupListItems } from "~/models/account-group.server";
import type { AccountErrors, AccountValues } from "~/models/account.server";
import { getAccount } from "~/models/account.server";
import { updateAccount } from "~/models/account.server";
import {
  validateAccount,
  parseBalanceAtStart,
  parseDate,
} from "~/models/account.server";
import { getAssetClassListItems } from "~/models/asset-class.server";
import { getStockListItems } from "~/models/stock.server";
import { requireUserId } from "~/session.server";
import {
  AccountTypeRadioGroup,
  AccountUnitRadioGroup,
} from "~/shared/accounts";
import {
  Select,
  CurrencyCombobox,
  DetailedRadioGroup,
  Input,
} from "~/shared/forms";
import { Modal, ModalSize } from "~/shared/modal";

type LoaderData = {
  assetClasses: Awaited<ReturnType<typeof getAssetClassListItems>>;
  accountGroups: Awaited<ReturnType<typeof getAccountGroupListItems>>;
  stocks: Awaited<ReturnType<typeof getStockListItems>>;
  account: NonNullable<Awaited<ReturnType<typeof getAccount>>>;
};

type ActionData = {
  errors?: AccountErrors;
  values?: AccountValues;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.accountId, "accountId not found");

  const account = await getAccount({ userId, id: params.accountId });
  if (!account) throw new Response("Not Found", { status: 404 });

  return json<LoaderData>({
    assetClasses: await getAssetClassListItems({ userId }),
    accountGroups: await getAccountGroupListItems({ userId }),
    stocks: await getStockListItems({ userId }),
    account,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
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

  invariant(typeof params.accountId === "string", "accountId not found");
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

  await updateAccount({
    id: params.accountId,
    name,
    type: type as AccountType,
    assetClassId,
    groupId,
    unit: unit as AccountUnit,
    currency,
    stockId,
    userId,
    preExisting: preExisting === "on",
    balanceAtStart: balanceAtStart ? parseBalanceAtStart(balanceAtStart) : null,
    openingDate: openingDate ? parseDate(openingDate) : null,
  });

  return redirect(`/accounts`);
};

export default function EditPage() {
  const nameInputRef = useRef(null);
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  const { assetClasses, accountGroups, stocks, account } =
    useLoaderData<LoaderData>();
  const [type, setType] = useState<AccountType>(
    (actionData?.values?.type as AccountType) || account.type
  );
  const [unit, setUnit] = useState<AccountUnit>(
    (actionData?.values?.unit as AccountUnit) || account.unit
  );
  const [preExisting, setPreExisting] = useState(
    actionData?.values?.preExisting === "on" || account.preExisting
  );
  return (
    <Modal initialFocus={nameInputRef} onClose={onClose} size={ModalSize.LARGE}>
      <Form method="post" replace>
        <Modal.Body title="Edit Account" icon={PencilIcon}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <Input
              label="Name"
              name="name"
              error={actionData?.errors?.name}
              groupClassName="sm:col-span-3"
              defaultValue={actionData?.values?.name || account.name}
              ref={nameInputRef}
            />
            <Select
              label="Group (optional)"
              name="groupId"
              error={actionData?.errors?.groupId}
              groupClassName="sm:col-span-3"
              defaultValue={
                actionData?.values?.groupId || account.groupId || undefined
              }
            >
              <option value=""></option>
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
              defaultValue={actionData?.values?.type || account.type}
              onChange={setType}
            />
            {type === AccountType.ASSET && (
              <Select
                label="Asset class"
                name="assetClassId"
                error={actionData?.errors?.assetClassId}
                groupClassName="sm:col-span-3"
                defaultValue={
                  actionData?.values?.assetClassId ||
                  account.assetClassId ||
                  undefined
                }
              >
                <option value=""></option>
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
              defaultValue={actionData?.values?.unit || account.unit}
              onChange={setUnit}
            />
            {unit === AccountUnit.CURRENCY && (
              <CurrencyCombobox
                name="currency"
                label="Currency"
                error={actionData?.errors?.currency}
                defaultValue={
                  actionData?.values?.currency || account.currency || undefined
                }
                groupClassName="sm:col-span-3"
              />
            )}
            {unit === AccountUnit.STOCK && (
              <Select
                label="Stock"
                name="stockId"
                error={actionData?.errors?.stockId}
                groupClassName="sm:col-span-3"
                defaultValue={
                  actionData?.values?.stockId || account.stockId || undefined
                }
              >
                <option value=""></option>
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
              defaultValue={
                actionData?.values?.preExisting ||
                (account.preExisting ? "on" : "off")
              }
              onChange={(value) => setPreExisting(value === "on")}
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
                groupClassName="sm:col-span-3"
                label="Balance at start"
                name="balanceAtStart"
                defaultValue={
                  actionData?.values?.balanceAtStart ||
                  account.balanceAtStart ||
                  undefined
                }
                error={actionData?.errors?.balanceAtStart}
              />
            ) : (
              <Input
                groupClassName="sm:col-span-3"
                label="Opening date"
                name="openingDate"
                type="date"
                defaultValue={
                  actionData?.values?.openingDate ||
                  account.openingDate?.split("T")[0] ||
                  undefined
                }
                error={actionData?.errors?.openingDate}
              />
            )}
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
