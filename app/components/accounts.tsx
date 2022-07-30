import { AccountType, AccountUnit } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import type { IconProps } from "~/icons";
import type { getAccountGroupListItems } from "~/models/account-group.server";
import type {
  AccountErrors,
  AccountValues,
  getAccount,
} from "~/models/account.server";
import type { getAssetClassListItems } from "~/models/asset-class.server";
import type { getStockListItems } from "~/models/stock.server";
import {
  CurrencyCombobox,
  DetailedRadioGroup,
  Input,
  RadioGroup,
  Select,
} from "~/shared/forms";
import { Modal, ModalSize } from "~/shared/modal";
import type { SerializeType } from "~/shared/util";

export type AccountFormLoaderData = {
  assetClasses: Awaited<ReturnType<typeof getAssetClassListItems>>;
  accountGroups: Awaited<ReturnType<typeof getAccountGroupListItems>>;
  stocks: Awaited<ReturnType<typeof getStockListItems>>;
  account?: NonNullable<Awaited<ReturnType<typeof getAccount>>>;
};

export type AccountFormActionData = {
  errors?: AccountErrors;
  values?: AccountValues;
};

export function AccountFormModal({
  open,
  title,
  icon,
  href,
  data: { account, accountGroups, assetClasses, stocks },
  onClose,
}: AccounFormModalProps) {
  const action = useFetcher<AccountFormActionData>();
  useEffect(() => {
    if (action.type === "actionRedirect") onClose();
  }, [action.type, onClose]);

  const [type, setType] = useState(account?.type || AccountType.ASSET);
  const [unit, setUnit] = useState(account?.unit || AccountUnit.CURRENCY);
  const [preExisting, setPreExisting] = useState(account?.preExisting || false);

  const disabled = action.state !== "idle";
  return (
    <Modal open={open} onClose={onClose} size={ModalSize.LARGE}>
      <action.Form method="post" action={href}>
        <fieldset disabled={disabled}>
          <Modal.Body title={title} icon={icon}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <Input
                label="Name"
                name="name"
                defaultValue={action.data?.values?.name || account?.name}
                error={action.data?.errors?.name}
                groupClassName="sm:col-span-3"
              />
              <Select
                label="Group"
                name="groupId"
                error={action.data?.errors?.groupId}
                groupClassName="sm:col-span-3"
                defaultValue={
                  action.data?.values?.groupId || account?.groupId || undefined
                }
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
                error={action.data?.errors?.type}
                groupClassName="sm:col-span-3"
                defaultValue={action.data?.values?.type || type}
                onChange={setType}
                disabled={disabled}
              />
              {type === AccountType.ASSET && (
                <Select
                  label="Asset class"
                  name="assetClassId"
                  error={action.data?.errors?.assetClassId}
                  groupClassName="sm:col-span-3"
                  defaultValue={
                    action.data?.values?.assetClassId ||
                    account?.assetClassId ||
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
                error={action.data?.errors?.unit}
                groupClassName="sm:col-span-3 sm:col-start-1"
                defaultValue={action.data?.values?.unit || unit}
                onChange={setUnit}
                disabled={disabled}
              />
              {unit === AccountUnit.CURRENCY && (
                <CurrencyCombobox
                  name="currency"
                  label="Currency"
                  error={action.data?.errors?.currency}
                  defaultValue={
                    action.data?.values?.currency ||
                    account?.currency ||
                    undefined
                  }
                  groupClassName="sm:col-span-3"
                />
              )}
              {unit === AccountUnit.STOCK && (
                <Select
                  label="Stock"
                  name="stockId"
                  error={action.data?.errors?.stockId}
                  groupClassName="sm:col-span-3"
                  defaultValue={
                    action.data?.values?.stockId ||
                    account?.stockId ||
                    undefined
                  }
                >
                  <option value=""></option>
                  {stocks.map((stock) => (
                    <option key={stock.id} value={stock.id}>
                      {stock.symbol}
                    </option>
                  ))}
                </Select>
              )}
              <DetailedRadioGroup
                groupClassName="sm:col-span-6"
                label="When was the account opened?"
                name="preExisting"
                defaultValue={
                  action.data?.values?.preExisting ||
                  (preExisting ? "on" : "off")
                }
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
                  defaultValue={
                    action.data?.values?.balanceAtStart ||
                    account?.balanceAtStart ||
                    undefined
                  }
                  error={action.data?.errors?.balanceAtStart}
                />
              ) : (
                <Input
                  key="openingDate"
                  groupClassName="sm:col-span-3"
                  label="Opening date"
                  name="openingDate"
                  type="date"
                  defaultValue={
                    action.data?.values?.openingDate ||
                    account?.openingDate?.split("T")[0] ||
                    undefined
                  }
                  error={action.data?.errors?.openingDate}
                />
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Button type="submit" variant="primary">
              {action.state !== "idle" ? "Saving…" : "Save"}
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
      </action.Form>
    </Modal>
  );
}

export type AccounFormModalProps = {
  title: string;
  icon: ComponentType<IconProps>;
  href: string;
  open: boolean;
  data: SerializeType<AccountFormLoaderData>;
  onClose: () => void;
};

function AccountTypeRadioGroup({
  groupClassName,
  label,
  name,
  error,
  onChange,
  defaultValue = AccountType.ASSET,
  disabled = false,
}: AccountTypeRadioGroupProps) {
  return (
    <RadioGroup
      label={label}
      name={name}
      error={error}
      onChange={onChange}
      defaultValue={defaultValue}
      groupClassName={groupClassName}
      disabled={disabled}
      options={[
        { value: AccountType.ASSET, label: "Asset" },
        { value: AccountType.LIABILITY, label: "Liability" },
      ]}
    />
  );
}

type AccountTypeRadioGroupProps = {
  groupClassName?: string;
  label: string;
  name: string;
  error?: string;
  defaultValue?: string;
  onChange?: (accountType: AccountType) => void;
  disabled?: boolean;
};

function AccountUnitRadioGroup({
  groupClassName,
  label,
  name,
  error,
  onChange,
  defaultValue = AccountUnit.CURRENCY,
  disabled,
}: AccountUnitRadioGroupProps) {
  return (
    <RadioGroup
      groupClassName={groupClassName}
      label={label}
      name={name}
      error={error}
      onChange={onChange}
      defaultValue={defaultValue}
      disabled={disabled}
      options={[
        { value: AccountUnit.CURRENCY, label: "Currency" },
        { value: AccountUnit.STOCK, label: "Stock" },
      ]}
    />
  );
}

type AccountUnitRadioGroupProps = {
  groupClassName?: string;
  label: string;
  name: string;
  error?: string;
  defaultValue?: string;
  onChange?: (accountUnit: AccountUnit) => void;
  disabled?: boolean;
};
