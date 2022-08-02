import type { IncomeExpenseCategoryType } from "@prisma/client";
import type {
  getIncomeExpenseCategory,
  IncomeExpenseCategoryValues,
} from "~/models/income-expense-categories.server";
import type { FormActionData, FormProps } from "./forms";
import { Input } from "./forms";

export type IncomeExpenseCategoryFormActionData =
  FormActionData<IncomeExpenseCategoryValues>;

export type IncomeExpenseCategoryFormLoaderData = {
  category?: NonNullable<Awaited<ReturnType<typeof getIncomeExpenseCategory>>>;
};

export function IncomeExpenseCategoryForm({
  values,
  errors,
  data: { category },
  type,
}: IncomeExpenseCategoryFormProps) {
  return (
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
      <input type="hidden" name="type" value={type} />
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

export type IncomeExpenseCategoryFormProps = FormProps<
  IncomeExpenseCategoryValues,
  IncomeExpenseCategoryFormLoaderData
> & {
  type: IncomeExpenseCategoryType;
};
