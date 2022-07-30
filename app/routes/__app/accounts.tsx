import { AccountType, AccountUnit } from "@prisma/client";
import { Link, Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import type { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useState } from "react";
import type { AccountFormLoaderData } from "~/components/accounts";
import { AccountFormModal } from "~/components/accounts";
import { currenciesByCode } from "~/currencies";
import { PencilIcon, PlusIcon } from "~/components/icons";
import { getAccountListItems } from "~/models/account.server";
import { requireUserId } from "~/session.server";
import { Button } from "~/components/button";
import type { SerializeType } from "~/utils";
import { getTitle } from "~/utils";

type LoaderData = { accounts: Awaited<ReturnType<typeof getAccountListItems>> };

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  return json<LoaderData>({ accounts: await getAccountListItems({ userId }) });
};

export const meta: MetaFunction = () => ({ title: getTitle("Accounts") });

export default function AccountsPage() {
  const [activeModal, setActiveModal] = useState<ActiveModal>();
  const [accountId, setAccountId] = useState<string>();
  const deleteAction = useFetcher();
  const accountFormLoader = useFetcher<SerializeType<AccountFormLoaderData>>();
  const { accounts } = useLoaderData<LoaderData>();
  return (
    <div className="px-4 py-2 sm:px-6 md:py-4 lg:px-8">
      <div className="sm:flex">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Accounts</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            onClick={() => {
              accountFormLoader.load("/accounts/new");
              setActiveModal("new");
            }}
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
                      Type / asset class
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Currency/stock
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Balance at start / opening date
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
                  {accounts.map((account) => (
                    <tr key={account.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {account.name}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {account.group?.name}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {account.type === AccountType.ASSET
                          ? account.assetClass?.name
                          : "Liability"}
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
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {account.preExisting
                          ? account.balanceAtStart
                          : account.openingDate}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          to={account.id}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                          <span className="sr-only">, {account.name}</span>
                        </Link>{" "}
                        &middot;{" "}
                        <button
                          type="button"
                          onClick={() => {
                            // TODO improve API
                            accountFormLoader.load(
                              `/accounts/${account.id}/edit`
                            );
                            setAccountId(account.id);
                            setActiveModal("edit");
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                          <span className="sr-only">, {account.name}</span>
                        </button>{" "}
                        &middot;{" "}
                        <deleteAction.Form
                          className="inline"
                          action="delete"
                          method="post"
                        >
                          <input type="hidden" name="id" value={account.id} />
                          <button
                            type="submit"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Delete
                            <span className="sr-only">, {account.name}</span>
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
      <Outlet />
      {accountFormLoader.state !== "loading" &&
        accountFormLoader.data &&
        (activeModal === "new" ? (
          <AccountFormModal
            title="New Account"
            icon={PlusIcon}
            href="/accounts/new"
            open={!!activeModal}
            data={accountFormLoader.data}
            onClose={closeActiveModal}
          />
        ) : (
          <AccountFormModal
            title="Edit Account"
            icon={PencilIcon}
            href={`/accounts/${accountId}/edit`}
            open={!!activeModal}
            data={accountFormLoader.data}
            onClose={closeActiveModal}
          />
        ))}
    </div>
  );

  function closeActiveModal() {
    setActiveModal(undefined);
  }
}

type ActiveModal = "new" | "edit";
