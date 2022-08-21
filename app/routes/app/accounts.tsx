import {
  Link,
  Outlet,
  useFetcher,
  useLoaderData,
  useMatches,
} from "@remix-run/react";
import type { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import type { AccountFormLoaderData } from "~/components/accounts";
import { AccountForm } from "~/components/accounts";
import { getAccountListItemsWithCurrentBalanceByAssetClass } from "~/models/accounts.server";
import { requireUserId } from "~/session.server";
import { getTitle, useUser } from "~/utils";
import { FormModal, useFormModal } from "~/components/forms";
import { cn } from "~/components/classnames";
import { PencilIcon, TrashIcon } from "~/components/icons";
import { NewButton } from "~/components/new-button";

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
      ? { title: "New Account", url: "/app/accounts/new" }
      : { title: "Edit Account", url: `/app/accounts/${mode.id}/edit` }
  );

  const deleteAction = useFetcher();

  const matches = useMatches();
  const isIndex = matches.some((m) => m.id === "routes/app/accounts/index");

  const { refCurrency } = useUser();
  const { accountsByAssetClass } = useLoaderData<LoaderData>();
  return (
    <div className="flex-1 md:grid md:grid-cols-accounts-1 md:divide-x md:divide-slate-200 md:overflow-hidden lg:grid-cols-accounts-2 xl:grid-cols-accounts-3 2xl:grid-cols-accounts-4">
      <div
        className={cn("overflow-auto", {
          "hidden md:block": !isIndex,
        })}
      >
        <div className="flex justify-end py-10 px-6">
          <NewButton
            variant="outline"
            color="slate"
            onClick={() => formModal.open({ type: "new" })}
          >
            New Account
          </NewButton>
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
                    className={cn("text-lg font-medium", {
                      "text-slate-800": total >= 0,
                      "text-rose-600": total < 0,
                    })}
                  >
                    {group.currentBalanceInRefCurrencyFormatted}
                  </div>
                </div>
                <ul className="content-start space-y-6 md:grid md:grid-cols-1 md:gap-6 md:space-y-0 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {group.accounts.map((a) => {
                    const balance = parseFloat(a.currentBalance);
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
                              className={cn("text-lg font-medium", {
                                "text-slate-800": balance >= 0,
                                "text-rose-600": balance < 0,
                              })}
                            >
                              {a.currentBalanceFormatted}
                            </div>
                            {a.currency !== refCurrency && (
                              <div className="text-sm text-slate-400">
                                {a.currentBalanceInRefCurrencyFormatted}
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
