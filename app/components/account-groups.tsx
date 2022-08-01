import type {
  AccountGroupErrors,
  AccountGroupValues,
  getAccountGroup,
} from "~/models/account-groups.server";
import type { FormProps } from "./forms";
import { Input } from "./forms";

export type AccountGroupFormLoaderData = {
  accountGroup?: NonNullable<Awaited<ReturnType<typeof getAccountGroup>>>;
};

export type AccountGroupFormActionData = {
  ok: boolean;
  errors?: AccountGroupErrors;
  values?: AccountGroupValues;
};

export function AccountGroupFormModal({
  values,
  errors,
  data: { accountGroup },
}: AccountGroupFormProps) {
  return (
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
      <Input
        label="Name"
        name="name"
        error={errors?.name}
        defaultValue={values?.name || accountGroup?.name}
        groupClassName="sm:col-span-6"
      />
    </div>
  );
}

export type AccountGroupFormProps = FormProps<
  AccountGroupValues,
  AccountGroupFormLoaderData
>;
