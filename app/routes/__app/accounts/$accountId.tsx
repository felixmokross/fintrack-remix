import { AccountUnit, BookingType } from "@prisma/client";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
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
import { Menu, Transition } from "@headlessui/react";
import { DotsVerticalIcon } from "~/components/icons";

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

  const deleteAction = useFetcher();

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
                  <td className="bg-slate-50 py-2 pl-3 pr-1 text-right text-sm text-slate-500">
                    {group.balanceFormatted}
                  </td>
                  <td className="bg-slate-50"></td>
                </tr>
                {group.lines.map((line, index) => (
                  <tr
                    key={line.id}
                    className={cn(
                      index === 0 ? "border-slate-300" : "border-slate-200",
                      "group border-t"
                    )}
                  >
                    <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="text-slate-800">
                        {line.transaction.bookings
                          .filter((b) => b.id !== line.id)
                          .map((b) => {
                            switch (b.type) {
                              case BookingType.CHARGE:
                              case BookingType.DEPOSIT:
                                invariant(b.account, "account not found");
                                return (
                                  <Link
                                    to={`../${b.account.id}`}
                                    className="text-sky-600 hover:underline"
                                  >
                                    {b.account.name}
                                  </Link>
                                );
                              case BookingType.INCOME:
                              case BookingType.EXPENSE:
                                invariant(
                                  b.incomeExpenseCategory,
                                  "incomeExpenseCategory not found"
                                );
                                return b.incomeExpenseCategory.name;
                              default:
                                return "";
                            }
                          })
                          .map((element, index) =>
                            index === 0 ? element : `, ${element}`
                          )}
                      </div>
                      <div className="text-slate-500">
                        {line.transaction.note}
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-1 text-right text-sm text-slate-800">
                      {line.amountFormatted}
                    </td>
                    <td className="w-5 items-center py-4 pr-1">
                      <Menu
                        as="div"
                        className="invisible relative inline-block text-left group-hover:visible"
                      >
                        <div>
                          <Menu.Button className="flex h-8 items-center rounded-full text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-100">
                            <span className="sr-only">Open options</span>
                            <DotsVerticalIcon
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </Menu.Button>
                        </div>

                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      formModal.open({
                                        type: "edit",
                                        id: line.transaction.id,
                                      })
                                    }
                                    className={cn(
                                      active
                                        ? "bg-slate-100 text-slate-900"
                                        : "text-slate-700",
                                      "block w-full px-4  py-2 text-left text-sm"
                                    )}
                                  >
                                    Edit
                                    <span className="sr-only">
                                      , {line.transaction.date},{" "}
                                      {line.transaction.note}
                                    </span>
                                  </button>
                                )}
                              </Menu.Item>
                              <deleteAction.Form
                                action={`/transactions/${line.transaction.id}/delete`}
                                method="post"
                              >
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      type="submit"
                                      className={cn(
                                        active
                                          ? "bg-slate-100 text-slate-900"
                                          : "text-slate-700",
                                        "block w-full px-4 py-2 text-left text-sm"
                                      )}
                                    >
                                      Delete
                                      <span className="sr-only">
                                        , {line.transaction.date},{" "}
                                        {line.transaction.note}
                                      </span>
                                    </button>
                                  )}
                                </Menu.Item>
                              </deleteAction.Form>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
            <tr className="border-t border-slate-200">
              <th className="bg-slate-50 px-4 py-2 text-left text-sm font-semibold text-slate-900 sm:px-6"></th>
              <td className="bg-slate-50 py-2 pl-3 pr-1 text-right text-sm text-slate-500">
                {account.initialBalanceFormatted}
              </td>
              <td className="bg-slate-50"></td>
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
