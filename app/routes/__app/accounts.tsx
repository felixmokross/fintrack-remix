import { AccountType, AccountUnit } from "@prisma/client";
import { Link, Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import type { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import type { AccountFormLoaderData } from "~/components/accounts";
import { AccountForm } from "~/components/accounts";
import { currenciesByCode } from "~/currencies";
import { getAccountListItemsWithCurrentBalanceByAssetClass } from "~/models/accounts.server";
import { requireUserId } from "~/session.server";
import { Button } from "~/components/button";
import { formatDate, formatValue, getTitle } from "~/utils";
import { FormModal, useFormModal } from "~/components/forms";
import { Fragment } from "react";
import { cn } from "~/components/classnames";

type LoaderData = {
  accountsByAssetClass: Awaited<
    ReturnType<typeof getAccountListItemsWithCurrentBalanceByAssetClass>
  >;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  return json<LoaderData>({
    accountsByAssetClass:
      await getAccountListItemsWithCurrentBalanceByAssetClass({ userId }),
  });
};

export const meta: MetaFunction = () => ({ title: getTitle("Accounts") });

export default function AccountsPage() {
  const formModal = useFormModal<AccountFormLoaderData>((mode) =>
    mode.type === "new"
      ? { title: "New Account", url: "/accounts/new" }
      : { title: "Edit Account", url: `/accounts/${mode.id}/edit` }
  );

  const deleteAction = useFetcher();

  const { accountsByAssetClass } = useLoaderData<LoaderData>();
  return (
    <div className="px-4 py-2 sm:px-6 md:py-4 lg:px-8">
      <div className="sm:flex">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Accounts</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            onClick={() => formModal.open({ type: "new" })}
            variant="secondary"
          >
            Add account
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
                      Name
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Group
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Currency/stock
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Balance at start / opening date
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Current balance
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Current balance in ref. ccy.
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {accountsByAssetClass.map((group) => (
                    <Fragment key={group.key}>
                      <tr className="border-t border-gray-200">
                        <th
                          colSpan={5}
                          scope="colgroup"
                          className="bg-gray-50 px-4 py-2 text-left text-sm font-semibold text-gray-900 sm:px-6"
                        >
                          {group.type === AccountType.ASSET
                            ? group.assetClass!.name
                            : "Liability"}
                        </th>
                        <td className="bg-gray-50 px-3 py-2 text-right text-sm text-gray-500">
                          {formatValue(group.currentBalanceInRefCurrency)}
                        </td>
                        <td className="bg-gray-50"></td>
                      </tr>
                      {group.accounts.map((account, index) => (
                        <tr
                          key={account.id}
                          className={cn(
                            index === 0 ? "border-gray-300" : "border-gray-200",
                            "border-t"
                          )}
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {account.name}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {account.group?.name}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {account.unit === AccountUnit.CURRENCY ? (
                              <>
                                {
                                  currenciesByCode[
                                    account.currency! as keyof typeof currenciesByCode
                                  ]
                                }{" "}
                                ({account.currency})
                              </>
                            ) : (
                              account.stock?.symbol
                            )}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-right text-sm font-medium text-gray-900 sm:pl-6">
                            {account.preExisting
                              ? formatValue(account.balanceAtStart!)
                              : formatDate(account.openingDate!)}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-right text-sm font-medium text-gray-900 sm:pl-6">
                            {formatValue(account.currentBalance)}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-right text-sm font-medium text-gray-900 sm:pl-6">
                            {formatValue(account.currentBalanceInRefCurrency)}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <Link
                              to={account.id}
                              prefetch="intent"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                              <span className="sr-only">, {account.name}</span>
                            </Link>{" "}
                            &middot;{" "}
                            <button
                              type="button"
                              onClick={() =>
                                formModal.open({ type: "edit", id: account.id })
                              }
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                              <span className="sr-only">, {account.name}</span>
                            </button>{" "}
                            &middot;{" "}
                            <deleteAction.Form
                              className="inline"
                              action={`${account.id}/delete`}
                              method="post"
                            >
                              <button
                                type="submit"
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Delete
                                <span className="sr-only">
                                  , {account.name}
                                </span>
                              </button>
                            </deleteAction.Form>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
      <FormModal modal={formModal} form={AccountForm} />
    </div>
  );
}
