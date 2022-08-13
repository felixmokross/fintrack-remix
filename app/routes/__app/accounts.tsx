import { Link, Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import type { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import type { AccountFormLoaderData } from "~/components/accounts";
import { AccountForm } from "~/components/accounts";
import { getAccountListItemsWithCurrentBalanceByAssetClass } from "~/models/accounts.server";
import { requireUserId } from "~/session.server";
import { Button } from "~/components/button";
import { getTitle } from "~/utils";
import { FormModal, useFormModal } from "~/components/forms";
import { cn } from "~/components/classnames";
import { Money } from "~/components/money";
import { PencilIcon, TrashIcon } from "~/components/icons";

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

const refCurrency = "CHF";

export default function AccountsPage() {
  const formModal = useFormModal<AccountFormLoaderData>((mode) =>
    mode.type === "new"
      ? { title: "New Account", url: "/accounts/new" }
      : { title: "Edit Account", url: `/accounts/${mode.id}/edit` }
  );

  const deleteAction = useFetcher();

  const { accountsByAssetClass } = useLoaderData<LoaderData>();
  return (
    <div className="h-screen md:grid md:grid-cols-accounts-1 md:divide-x md:divide-slate-200 lg:grid-cols-accounts-2 xl:grid-cols-accounts-3 2xl:grid-cols-accounts-4">
      <div className="hidden overflow-auto md:block">
        <div className="flex justify-end py-10 px-6">
          <Button onClick={() => formModal.open({ type: "new" })}>
            New Account
          </Button>
        </div>

        <ul className="space-y-10">
          {accountsByAssetClass.map((group) => {
            const total = parseFloat(group.currentBalanceInRefCurrency);
            return (
              <li
                key={group.key}
                className="space-y-6 border-t border-b border-slate-200 bg-slate-50 px-6 pt-5 pb-6 shadow-sm"
              >
                <div className="flex items-center justify-between space-x-3 px-4">
                  <h2 className="text-lg font-medium text-slate-600">
                    {group.assetClass ? group.assetClass.name : "Liabilities"}
                  </h2>
                  <div
                    className={cn("text-lg", {
                      "text-emerald-600": total >= 0,
                      "text-rose-600": total < 0,
                    })}
                  >
                    <Money
                      value={total}
                      currency={refCurrency}
                      showCompact={true}
                    />
                  </div>
                </div>
                <ul className="content-start gap-6 sm:grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {group.accounts.map((a) => {
                    const balanceInRefCurrency = parseFloat(
                      a.currentBalanceInRefCurrency
                    );
                    return (
                      <li key={a.id}>
                        <Link
                          to={a.id}
                          prefetch="intent"
                          className="group flex h-32 flex-col-reverse justify-between rounded-lg border border-slate-50 bg-white p-4 text-slate-700 shadow hover:border-slate-200 hover:text-slate-500 hover:shadow-inner"
                        >
                          <div className="flex items-end justify-between">
                            <h3 className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">
                              {a.name}
                            </h3>
                            <div className="hidden items-center gap-2 group-hover:flex">
                              <button
                                type="button"
                                className="text-slate-400 hover:text-slate-600"
                                onClick={(e) => {
                                  formModal.open({
                                    type: "edit",
                                    id: a.id,
                                  });
                                  e.preventDefault();
                                }}
                              >
                                <PencilIcon className="h-4 w-4" />
                                <span className="sr-only">Edit {a.name}</span>
                              </button>
                              {/* TODO figure out why normal form submit does not work (form within an a?) */}
                              <deleteAction.Form
                                action={`${a.id}/delete`}
                                className="flex"
                                method="post"
                              >
                                <button
                                  type="submit"
                                  className="text-slate-400 hover:text-slate-600"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    deleteAction.submit(
                                      e.currentTarget
                                        .parentElement as HTMLFormElement
                                    );
                                  }}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                  <span className="sr-only">
                                    Delete {a.name}
                                  </span>
                                </button>
                              </deleteAction.Form>
                            </div>
                          </div>
                          <div className="self-end text-right">
                            <div
                              className={cn("text-lg", {
                                "text-emerald-600": balanceInRefCurrency >= 0,
                                "text-rose-600": balanceInRefCurrency < 0,
                              })}
                            >
                              <Money
                                value={balanceInRefCurrency}
                                currency={refCurrency}
                                showCompact={true}
                              />
                            </div>
                            {a.currency !== refCurrency && (
                              <div className="text-sm text-slate-400">
                                {a.currency ? (
                                  <Money
                                    value={parseFloat(a.currentBalance)}
                                    currency={a.currency}
                                  />
                                ) : (
                                  `Stock ${a.currentBalance}`
                                )}
                              </div>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
      <Outlet />
      <FormModal modal={formModal} form={AccountForm} />
    </div>
  );
}
