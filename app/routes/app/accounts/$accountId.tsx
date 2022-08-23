import { AccountUnit, BookingType } from "@prisma/client";
import type { LinkProps } from "@remix-run/react";
import { useTransition } from "@remix-run/react";
import { useFetcher, useLoaderData, useLocation } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import type { RefObject } from "react";
import { useState } from "react";
import { Fragment, useEffect, useLayoutEffect, useRef } from "react";
import invariant from "tiny-invariant";
import { currenciesByCode } from "~/currencies";
import { getAccount } from "~/models/accounts.server";
import { getReverseLedgerDateGroups } from "~/models/ledger-lines.server";
import { requireUserId } from "~/session.server";
import { cn } from "~/components/classnames";
import type { TransactionFormLoaderData } from "~/components/transactions";
import { TransactionForm } from "~/components/transactions";
import type { UseFormModalReturnValue } from "~/components/forms";
import { FormModal, useFormModal } from "~/components/forms";
import { ModalSize } from "~/components/modal";
import { Menu, Transition } from "@headlessui/react";
import { DotsVerticalIcon } from "~/components/icons";
import { Link } from "~/components/link";
import { NewButton } from "~/components/new-button";
import type { SerializeType } from "~/utils";

type LoaderData = {
  account: NonNullable<Awaited<ReturnType<typeof getAccount>>>;
  ledgerDateGroups: NonNullable<
    Awaited<ReturnType<typeof getReverseLedgerDateGroups>>
  >;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.accountId, "accountId not found");

  const url = new URL(request.url);
  const pageString = url.searchParams.get("page");
  const page = pageString ? parseInt(pageString) : 0;

  const account = await getAccount({
    id: params.accountId,
    userId,
  });
  if (!account) return new Response("Not found", { status: 404 });

  const ledgerDateGroups = await getReverseLedgerDateGroups({
    account,
    userId,
    page,
  });

  return json({ account, ledgerDateGroups });
};

export default function AccountDetailPage() {
  const formModal = useFormModal<TransactionFormLoaderData>((mode) =>
    mode.type === "new"
      ? { title: "New Transaction", url: "/app/transactions/new" }
      : { title: "Edit Transaction", url: `/app/transactions/${mode.id}/edit` }
  );

  const { account, ledgerDateGroups } = useLoaderData<LoaderData>();

  const containerRef = useRef<HTMLDivElement>(null);
  useContainerScrollRestoration(containerRef);

  return (
    <div
      ref={containerRef}
      className="h-app divide-y divide-slate-200 overflow-y-auto"
    >
      <LedgerLink to=".." className="md:hidden">
        &larr; All accounts
      </LedgerLink>
      <div className="pt-6">
        <div className="px-6 sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-lg font-semibold text-gray-900">
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
            <NewButton
              onClick={() => formModal.open({ type: "new" })}
              variant="solid"
              color="sky"
            >
              Add transaction
            </NewButton>
          </div>
        </div>
        <Ledger
          key={account.id}
          ledgerDateGroups={ledgerDateGroups}
          formModal={formModal}
        />
        <FormModal
          size={ModalSize.EXTRA_LARGE}
          modal={formModal}
          form={TransactionForm}
          prefillAccountId={account.id}
        />
      </div>
    </div>
  );
}

function mergeLedgerDateGroups(
  first: SerializeType<LoaderData>["ledgerDateGroups"]["groups"],
  second: SerializeType<LoaderData>["ledgerDateGroups"]["groups"]
) {
  if (first.length === 0) return second;
  if (second.length === 0) return first;

  if (first.at(-1)!.date !== second[0].date) {
    return first.concat(second);
  }

  return first
    .slice(0, -1)
    .concat({
      ...first.at(-1)!,
      lines: first.at(-1)!.lines.concat(second[0].lines),
    })
    .concat(second.slice(1));
}

function Ledger({ ledgerDateGroups, formModal }: LedgerProps) {
  const deleteAction = useFetcher();
  const pageLoader = useFetcher<SerializeType<LoaderData>>();
  const currentPage = pageLoader.data?.ledgerDateGroups.page || 0;
  const [groups, setGroups] = useState(ledgerDateGroups.groups);

  useEffect(() => {
    if (pageLoader.type === "done")
      setGroups((groups) =>
        mergeLedgerDateGroups(groups, pageLoader.data.ledgerDateGroups.groups)
      );
  }, [pageLoader]);

  return (
    <div className="mt-8 flex flex-col divide-y divide-slate-200">
      <table className="w-full">
        <tbody className="bg-white">
          {groups.map((group) => (
            <Fragment key={group.date}>
              <tr className="border-t border-slate-200">
                <th className="bg-slate-50 px-4 py-2 text-left text-sm font-semibold text-slate-900 sm:px-6">
                  {group.dateFormatted}
                </th>
                <td className="bg-slate-50 py-2 pl-3 pr-1 text-right text-sm font-medium text-slate-500">
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
                              // TODO temporarily disabled invariant until all accounts can be migrated
                              // invariant(b.account, "account not found");
                              return (
                                <Link key={b.id} to={`../${b.account?.id}`}>
                                  {b.account?.name || "--- unavailable ---"}
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
                  <td
                    className={cn(
                      "whitespace-nowrap py-4 pl-3 pr-1 text-right text-sm font-medium",
                      {
                        "text-slate-800": (
                          [
                            BookingType.CHARGE,
                            BookingType.EXPENSE,
                            BookingType.DEPRECIATION,
                          ] as BookingType[]
                        ).includes(line.type),
                        "text-emerald-600": (
                          [
                            BookingType.DEPOSIT,
                            BookingType.INCOME,
                            BookingType.APPRECIATION,
                          ] as BookingType[]
                        ).includes(line.type),
                      }
                    )}
                  >
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
                              action={`/app/transactions/${line.transaction.id}/delete`}
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
              {ledgerDateGroups.initialPageBalanceFormatted}
            </td>
            <td className="bg-slate-50"></td>
          </tr>
        </tbody>
      </table>
      {currentPage < ledgerDateGroups.pageCount - 1 && (
        <pageLoader.Form className="block py-8 text-center text-sm font-medium text-sky-600 hover:bg-slate-50 hover:underline">
          <input type="hidden" name="page" value={currentPage + 1} />
          <button type="submit" className="h-full w-full">
            Load more…
          </button>
        </pageLoader.Form>
      )}
    </div>
  );
}

type LedgerProps = {
  ledgerDateGroups: SerializeType<LoaderData>["ledgerDateGroups"];
  formModal: UseFormModalReturnValue<TransactionFormLoaderData>;
};

function LedgerLink({ className, children, ...props }: LinkProps) {
  return (
    <Link
      className={cn(
        "block py-8 text-center text-sm hover:bg-slate-50",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

// inspired by https://github.com/remix-run/remix/blob/main/packages/remix-react/scroll-restoration.tsx, but for scrollable containers
const positions: { [key: string]: number } = {};

function useContainerScrollRestoration<TElement extends HTMLElement>(
  containerRef: RefObject<TElement>
) {
  const location = useLocation();
  const transition = useTransition();

  useEffect(() => {
    if (!containerRef.current) return;

    if (transition.location)
      positions[location.key] = containerRef.current.scrollTop;
  }, [transition, location, containerRef]);

  if (typeof document !== "undefined") {
    // disable useLayoutEffect SSR warning, see for context https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
    // should be fine since it is not really conditionally within the same environment (server vs. client)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useLayoutEffect(() => {
      if (!containerRef.current) return;

      const y = positions[location.key] || 0;

      containerRef.current.scrollTo(0, y);
    }, [containerRef, location]);
  }
}
