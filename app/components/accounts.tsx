import { AccountType, AccountUnit } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { PlusIcon } from "~/icons";
import type {
  ActionData as NewAccountActionData,
  LoaderData as NewAccountLoaderData,
} from "~/routes/__app/accounts/new";
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

export function NewAccountModal({ open, onClose }: NewAccountModalProps) {
  const loader = useFetcher<NewAccountLoaderData>();
  const action = useFetcher<NewAccountActionData>();
  const [type, setType] = useState<AccountType>(
    (action.data?.values?.type as AccountType) || AccountType.ASSET
  );
  const [unit, setUnit] = useState<AccountUnit>(
    (action.data?.values?.unit as AccountUnit) || AccountUnit.CURRENCY
  );
  const [preExisting, setPreExisting] = useState(
    action.data?.values?.preExisting === "on" || false
  );

  useEffect(() => {
    if (action.type === "actionRedirect") onClose();
  }, [action.type, onClose]);

  useEffect(() => {
    if (open && loader.type === "init") loader.load("/accounts/new");
  }, [open, loader]);

  const disabled = action.state !== "idle" || loader.state !== "idle";

  return (
    <Modal open={open} onClose={onClose} size={ModalSize.LARGE}>
      <action.Form action="new" method="post">
        <fieldset disabled={disabled}>
          <Modal.Body title="New Account" icon={PlusIcon}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <Input
                label="Name"
                name="name"
                error={action.data?.errors?.name}
                groupClassName="sm:col-span-3"
                defaultValue={action.data?.values?.name}
              />
              <Select
                label="Group"
                name="groupId"
                error={action.data?.errors?.groupId}
                groupClassName="sm:col-span-3"
                defaultValue={action.data?.values?.groupId}
              >
                <option value="">[None]</option>
                <option disabled>───────────────</option>
                {loader.data?.accountGroups.map((accountGroup) => (
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
                defaultValue={action.data?.values?.type}
                onChange={setType}
                disabled={disabled}
              />
              {type === AccountType.ASSET && (
                <Select
                  label="Asset class"
                  name="assetClassId"
                  error={action.data?.errors?.assetClassId}
                  groupClassName="sm:col-span-3"
                  defaultValue={action.data?.values?.assetClassId || undefined}
                >
                  {loader.data?.assetClasses.map((assetClass) => (
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
                defaultValue={action.data?.values?.unit}
                onChange={setUnit}
                disabled={disabled}
              />
              {unit === AccountUnit.CURRENCY && (
                <CurrencyCombobox
                  name="currency"
                  label="Currency"
                  error={action.data?.errors?.currency}
                  defaultValue={action.data?.values?.currency || undefined} // TODO add reference currency as default
                  groupClassName="sm:col-span-3"
                />
              )}
              {unit === AccountUnit.STOCK && (
                <Select
                  label="Stock"
                  name="stockId"
                  error={action.data?.errors?.stockId}
                  groupClassName="sm:col-span-3"
                  defaultValue={action.data?.values?.stockId || undefined}
                >
                  {loader.data?.stocks.map((stock) => (
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
                defaultValue={action.data?.values?.preExisting || "off"}
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
                    action.data?.values?.balanceAtStart || undefined
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
                  defaultValue={action.data?.values?.openingDate || undefined}
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

export type NewAccountModalProps = {
  open: boolean;
  onClose: () => void;
};
