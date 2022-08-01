import type {
  AssetClassValues,
  getAssetClass,
} from "~/models/asset-classes.server";
import type { FormActionData, FormProps } from "./forms";
import { Input } from "./forms";

export type AssetClassFormLoaderData = {
  assetClass?: NonNullable<Awaited<ReturnType<typeof getAssetClass>>>;
};

export type AssetClassFormActionData = FormActionData<AssetClassValues>;

export function AssetClassForm({
  values,
  errors,
  data: { assetClass },
}: AssetClassFormProps) {
  return (
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
      <Input
        label="Name"
        name="name"
        error={errors?.name}
        defaultValue={values?.name || assetClass?.name}
        groupClassName="sm:col-span-3"
      />
      <Input
        label="Sort order"
        name="sortOrder"
        error={errors?.sortOrder}
        defaultValue={values?.sortOrder || assetClass?.sortOrder}
        groupClassName="sm:col-span-3"
      />
    </div>
  );
}

export type AssetClassFormProps = FormProps<
  AssetClassValues,
  AssetClassFormLoaderData
>;
