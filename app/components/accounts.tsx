import { AccountType, AccountUnit } from "@prisma/client";
import { useState } from "react";
import type { getAccountGroupListItems } from "~/models/account-groups.server";
import type {
  AccountErrors,
  AccountValues,
  getAccount,
} from "~/models/accounts.server";
import type { getAssetClassListItems } from "~/models/asset-classes.server";
import type { getStockListItems } from "~/models/stocks.server";
import {
  CurrencyCombobox,
  DetailedRadioGroup,
  FormModal,
  Input,
  RadioGroup,
  Select,
} from "~/components/forms";
import type { SerializeType } from "~/utils";

export type AccountFormLoaderData = {
  assetClasses: Awaited<ReturnType<typeof getAssetClassListItems>>;
  accountGroups: Awaited<ReturnType<typeof getAccountGroupListItems>>;
  stocks: Awaited<ReturnType<typeof getStockListItems>>;
  account?: NonNullable<Awaited<ReturnType<typeof getAccount>>>;
};

export type AccountFormActionData = {
  ok: boolean;
  errors?: AccountErrors;
  values?: AccountValues;
};

export function AccountFormModal({
  open,
  data: { account, accountGroups, assetClasses, stocks },
  onClose,
}: AccountFormModalProps) {
  const [type, setType] = useState(account?.type || AccountType.ASSET);
  const [unit, setUnit] = useState(account?.unit || AccountUnit.CURRENCY);
  const [preExisting, setPreExisting] = useState(account?.preExisting || false);

  return (
    <FormModal<AccountFormActionData>
      open={open}
      onClose={onClose}
      mode={account ? "edit" : "new"}
      actionUrl={account ? `${account.id}/edit` : "new"}
      title={account ? "Edit Account" : "New Account"}
    >
      {({ disabled, values, errors }) => (
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <Input
            label="Name"
            name="name"
            defaultValue={values?.name || account?.name}
            error={errors?.name}
            groupClassName="sm:col-span-3"
          />
          <Select
            label="Group"
            name="groupId"
            error={errors?.groupId}
            groupClassName="sm:col-span-3"
            defaultValue={values?.groupId || account?.groupId || undefined}
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
            error={errors?.type}
            groupClassName="sm:col-span-3"
            defaultValue={values?.type || type}
            onChange={setType}
            disabled={disabled}
          />
          {type === AccountType.ASSET && (
            <Select
              label="Asset class"
              name="assetClassId"
              error={errors?.assetClassId}
              groupClassName="sm:col-span-3"
              defaultValue={
                values?.assetClassId || account?.assetClassId || undefined
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
            error={errors?.unit}
            groupClassName="sm:col-span-3 sm:col-start-1"
            defaultValue={values?.unit || unit}
            onChange={setUnit}
            disabled={disabled}
          />
          {unit === AccountUnit.CURRENCY && (
            <CurrencyCombobox
              name="currency"
              label="Currency"
              error={errors?.currency}
              defaultValue={values?.currency || account?.currency || undefined}
              groupClassName="sm:col-span-3"
            />
          )}
          {unit === AccountUnit.STOCK && (
            <Select
              label="Stock"
              name="stockId"
              error={errors?.stockId}
              groupClassName="sm:col-span-3"
              defaultValue={values?.stockId || account?.stockId || undefined}
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
            defaultValue={values?.preExisting || (preExisting ? "on" : "off")}
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
                values?.balanceAtStart || account?.balanceAtStart || undefined
              }
              error={errors?.balanceAtStart}
            />
          ) : (
            <Input
              key="openingDate"
              groupClassName="sm:col-span-3"
              label="Opening date"
              name="openingDate"
              type="date"
              defaultValue={
                values?.openingDate ||
                account?.openingDate?.split("T")[0] ||
                undefined
              }
              error={errors?.openingDate}
            />
          )}
        </div>
      )}
    </FormModal>
  );
}

export type AccountFormModalProps = {
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
