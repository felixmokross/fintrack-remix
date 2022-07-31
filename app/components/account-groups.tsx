import type {
  AccountGroupErrors,
  AccountGroupValues,
  getAccountGroup,
} from "~/models/account-groups.server";
import type { SerializeType } from "~/utils";
import { FormModal, Input } from "./forms";

export type AccountGroupFormLoaderData = {
  accountGroup?: NonNullable<Awaited<ReturnType<typeof getAccountGroup>>>;
};

export type AccountGroupFormActionData = {
  ok: boolean;
  errors?: AccountGroupErrors;
  values?: AccountGroupValues;
};

export function AccountGroupFormModal({
  open,
  data: { accountGroup },
  onClose,
}: AccountGroupFormModalProps) {
  return (
    <FormModal<AccountGroupFormActionData>
      open={open}
      onClose={onClose}
      mode={accountGroup ? "edit" : "new"}
      actionUrl={accountGroup ? `${accountGroup.id}/edit` : "new"}
      title={accountGroup ? "Edit Account" : "New Account"}
    >
      {({ values, errors }) => (
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <Input
            label="Name"
            name="name"
            error={errors?.name}
            defaultValue={values?.name || accountGroup?.name}
            groupClassName="sm:col-span-6"
          />
        </div>
      )}
    </FormModal>
  );
}

export type AccountGroupFormModalProps = {
  open: boolean;
  data: SerializeType<AccountGroupFormLoaderData>;
  onClose: () => void;
};
