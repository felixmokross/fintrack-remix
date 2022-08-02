import type {
  getIncomeExpenseCategory,
  IncomeExpenseCategoryValues,
} from "~/models/income-expense-categories.server";
import type { FormActionData, FormProps } from "./forms";
import { Input } from "./forms";

export type IncomeCategoryFormActionData =
  FormActionData<IncomeExpenseCategoryValues>;

export type IncomeCategoryFormLoaderData = {
  category?: NonNullable<Awaited<ReturnType<typeof getIncomeExpenseCategory>>>;
};

export function IncomeCategoryForm({
  values,
  errors,
  data: { category },
}: IncomeCategoryFormProps) {
  return (
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
      <Input
        label="Name"
        name="name"
        error={errors?.name}
        defaultValue={values?.name || category?.name}
        groupClassName="sm:col-span-6"
      />
    </div>
  );
}

export type IncomeCategoryFormProps = FormProps<
  IncomeExpenseCategoryValues,
  IncomeCategoryFormLoaderData
>;
