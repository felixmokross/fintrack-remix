import { useFetcher, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getStockListItems } from "~/models/stocks.server";
import { requireUserId } from "~/session.server";
import { Button } from "~/components/button";
import { FormModal, useFormModal } from "~/components/forms";
import type { StockFormLoaderData } from "~/components/stocks";
import { StockForm } from "~/components/stocks";

type LoaderData = {
  stocks: Awaited<ReturnType<typeof getStockListItems>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const stocks = await getStockListItems({ userId });
  return json<LoaderData>({ stocks });
};

export default function StocksPage() {
  const formModal = useFormModal<StockFormLoaderData>((mode) =>
    mode.type === "new"
      ? { title: "New Stock", url: "/settings/stocks/new" }
      : { title: "Edit Stock", url: `/settings/stocks/${mode.id}/edit` }
  );

  const { stocks } = useLoaderData<LoaderData>();
  const deleteAction = useFetcher();
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Stocks</h1>
          <p className="mt-2 text-sm text-gray-700">
            Add stocks you have in your portfolio in order to track their value
            automatically.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            onClick={() => formModal.open({ type: "new" })}
            variant="primary"
          >
            Add stock
          </Button>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Symbol
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Trading Currency
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {stocks.map((stock) => (
                    <tr key={stock.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {stock.symbol}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {stock.tradingCurrency}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          type="button"
                          onClick={() =>
                            formModal.open({ type: "edit", id: stock.id })
                          }
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                          <span className="sr-only">, {stock.symbol}</span>
                        </button>{" "}
                        &middot;{" "}
                        <deleteAction.Form
                          className="inline"
                          action={`${stock.id}/delete`}
                          method="post"
                        >
                          <button
                            type="submit"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Delete
                            <span className="sr-only">, {stock.id}</span>
                          </button>
                        </deleteAction.Form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <FormModal modal={formModal} form={StockForm} />
    </div>
  );
}
