import { AccountType, AccountUnit } from "@prisma/client";
import { RadioGroup } from "./forms";

export function AccountTypeRadioGroup({
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

export function AccountUnitRadioGroup({
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
