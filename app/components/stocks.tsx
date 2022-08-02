import type { getStock, StockValues } from "~/models/stocks.server";
import type { FormActionData, FormProps } from "./forms";
import { CurrencyCombobox, Input } from "./forms";

export type StockFormActionData = FormActionData<StockValues>;

export type StockFormLoaderData = {
  stock?: NonNullable<Awaited<ReturnType<typeof getStock>>>;
};

export function StockForm({ values, errors, data: { stock } }: StockFormProps) {
  return (
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
      <Input
        label="Symbol"
        name="symbol"
        defaultValue={values?.symbol || stock?.symbol}
        error={errors?.symbol}
        groupClassName="sm:col-span-2"
      />
      <CurrencyCombobox
        name="tradingCurrency"
        label="Trading currency"
        error={errors?.tradingCurrency}
        defaultValue={values?.tradingCurrency || stock?.tradingCurrency}
        groupClassName="sm:col-span-4"
      />
    </div>
  );
}

export type StockFormProps = FormProps<StockValues, StockFormLoaderData>;
