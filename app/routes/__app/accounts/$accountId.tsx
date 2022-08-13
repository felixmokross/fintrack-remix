import { AccountUnit, BookingType } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Fragment } from "react";
import invariant from "tiny-invariant";
import { currenciesByCode } from "~/currencies";
import { getAccountWithInitialBalance } from "~/models/accounts.server";
import { getReverseLedgerDateGroups } from "~/models/ledger-lines.server";
import { requireUserId } from "~/session.server";
import { Button } from "~/components/button";
import { cn } from "~/components/classnames";
import type { TransactionFormLoaderData } from "~/components/transactions";
import { TransactionForm } from "~/components/transactions";
import { FormModal, useFormModal } from "~/components/forms";
import { ModalSize } from "~/components/modal";
import { getUserById } from "~/models/users.server";

type LoaderData = {
  account: NonNullable<
    Awaited<ReturnType<typeof getAccountWithInitialBalance>>
  >;
  ledgerDateGroups: NonNullable<
    Awaited<ReturnType<typeof getReverseLedgerDateGroups>>
  >;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.accountId, "accountId not found");
  const user = await getUserById(userId);

  const account = await getAccountWithInitialBalance({
    id: params.accountId,
    userId,
    preferredLocale: user!.preferredLocale,
  });
  if (!account) return new Response("Not found", { status: 404 });

  const ledgerDateGroups = await getReverseLedgerDateGroups({
    account,
    userId,
  });

  return json({ account, ledgerDateGroups });
};

export default function AccountDetailPage() {
  const formModal = useFormModal<TransactionFormLoaderData>((mode) =>
    mode.type === "new"
      ? { title: "New Transaction", url: "/transactions/new" }
      : { title: "Edit Transaction", url: `/transactions/${mode.id}/edit` }
  );

  // const deleteAction = useFetcher();

  const { account, ledgerDateGroups } = useLoaderData<LoaderData>();
  return (
    <div className="overflow-y-auto pt-6">
      <div className="px-6 sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900">
            {account.name}
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            {account.unit === AccountUnit.CURRENCY ? (
              <>
                Currency:{" "}
                {
                  currenciesByCode[
                    account.currency as keyof typeof currenciesByCode
                  ]
                }{" "}
                ({account.currency})
              </>
            ) : (
              <>Stock: {account.stock?.symbol}</>
            )}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            onClick={() => formModal.open({ type: "new" })}
            variant="primary"
          >
            Add transaction
          </Button>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <table className="w-full">
          <tbody className="bg-white">
            {ledgerDateGroups.map((group) => (
              <Fragment key={group.date}>
                <tr className="border-t border-slate-200">
                  <th className="bg-slate-50 px-4 py-2 text-left text-sm font-semibold text-slate-900 sm:px-6">
                    {group.dateFormatted}
                  </th>
                  <td className="bg-slate-50 px-3 py-2 text-right text-sm text-slate-500">
                    {group.balanceFormatted}
                  </td>
                  {/* <td className="bg-slate-50"></td> */}
                </tr>
                {group.lines.map((line, index) => (
                  <tr
                    key={line.id}
                    className={cn(
                      index === 0 ? "border-slate-300" : "border-slate-200",
                      "border-t"
                    )}
                  >
                    <td className="py-4 pl-4 pr-3 text-sm text-slate-500 sm:pl-6">
                      <div>{line.type}</div>
                      <div>
                        {line.transaction.bookings
                          .filter((b) => b.id !== line.id)
                          .map((b) => {
                            switch (b.type) {
                              case BookingType.CHARGE:
                              case BookingType.DEPOSIT:
                                return `${b.type} ${b.account?.name}${
                                  b.note ? ` (${b.note})` : ""
                                }`;
                              case BookingType.INCOME:
                              case BookingType.EXPENSE:
                                return `${b.type} ${
                                  b.incomeExpenseCategory?.name
                                }${b.note ? ` (${b.note})` : ""}`;
                              default:
                                return `${b.type}${
                                  b.note ? ` (${b.note})` : ""
                                }`;
                            }
                          })
                          .join(", ")}
                      </div>
                      <div>{line.transaction.note}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-slate-500">
                      {line.amountFormatted}
                    </td>
                    {/* <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              type="button"
                              onClick={() =>
                                formModal.open({
                                  type: "edit",
                                  id: line.transaction.id,
                                })
                              }
                              className="text--600 hover:text--900"
                            >
                              Edit
                              <span className="sr-only">
                                , {line.transaction.date},{" "}
                                {line.transaction.note}
                              </span>
                            </button>{" "}
                            &middot;{" "}
                            <deleteAction.Form
                              className="inline"
                              action={`/transactions/${line.transaction.id}/delete`}
                              method="post"
                            >
                              <button
                                type="submit"
                                className="text--600 hover:text--900"
                              >
                                Delete
                                <span className="sr-only">
                                  , {line.transaction.date},{" "}
                                  {line.transaction.note}
                                </span>
                              </button>
                            </deleteAction.Form>
                          </td> */}
                  </tr>
                ))}
              </Fragment>
            ))}
            <tr className="border-t border-slate-200">
              <th className="bg-slate-50 px-4 py-2 text-left text-sm font-semibold text-slate-900 sm:px-6"></th>
              <td className="bg-slate-50 px-3 py-2 text-right text-sm text-slate-500">
                {account.initialBalanceFormatted}
              </td>
              {/* <td className="bg-slate-50"></td> */}
            </tr>
          </tbody>
        </table>
      </div>
      <FormModal
        size={ModalSize.EXTRA_LARGE}
        modal={formModal}
        form={TransactionForm}
        prefillAccountId={account.id}
      />
    </div>
  );
}
