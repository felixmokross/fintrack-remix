import { AccountType, AccountUnit } from "@prisma/client";
import { RadioGroup } from "./forms";

export function AccountTypeRadioGroup({
  groupClassName,
  label,
  name,
  error,
  onChange,
  defaultValue = AccountType.ASSET,
}: AccountTypeRadioGroupProps) {
  return (
    <RadioGroup
      label={label}
      name={name}
      error={error}
      onChange={onChange}
      defaultValue={defaultValue}
      groupClassName={groupClassName}
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
};

export function AccountUnitRadioGroup({
  groupClassName,
  label,
  name,
  error,
  onChange,
  defaultValue = AccountUnit.CURRENCY,
}: AccountUnitRadioGroupProps) {
  return (
    <RadioGroup
      groupClassName={groupClassName}
      label={label}
      name={name}
      error={error}
      onChange={onChange}
      defaultValue={defaultValue}
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
};
