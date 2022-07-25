import { AccountUnit, BookingType } from "@prisma/client";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Fragment } from "react";
import invariant from "tiny-invariant";
import { currenciesByCode } from "~/currencies";
import { getAccount } from "~/models/account.server";
import { getLedgerLines } from "~/models/ledger-lines.server";
import { requireUserId } from "~/session.server";
import { Button } from "~/shared/button";
import { cn } from "~/shared/classnames";

type LoaderData = {
  account: NonNullable<Awaited<ReturnType<typeof getAccount>>>;
  ledgerLines: NonNullable<Awaited<ReturnType<typeof getLedgerLines>>>;
};

const groups = [
  {
    name: "Default",
  },
];

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.accountId, "accountId not found");

  const account = await getAccount({ id: params.accountId, userId });
  if (!account) return new Response("Not found", { status: 404 });

  const ledgerLines = await getLedgerLines({ accountId: account.id, userId });
  ledgerLines.reverse();

  return json({ account, ledgerLines });
};

export default function AccountDetailPage() {
  const { account, ledgerLines } = useLoaderData<LoaderData>();
  return (
    <div className="mt-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            {account.name}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
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
          <Button as={Link} to="/transactions/new" variant="primary">
            Add transaction
          </Button>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full">
                <thead className="bg-white">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Bookings
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Note
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                    >
                      Balance
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {groups.map((location) => (
                    <Fragment key={location.name}>
                      <tr className="border-t border-gray-200">
                        <th
                          colSpan={7}
                          scope="colgroup"
                          className="bg-gray-50 px-4 py-2 text-left text-sm font-semibold text-gray-900 sm:px-6"
                        >
                          {location.name}
                        </th>
                      </tr>
                      {ledgerLines.map((ledgerLine) => (
                        <tr
                          key={ledgerLine.id}
                          className={cn(
                            // personIdx === 0
                            //   ? "border-gray-300"
                            "border-gray-200",
                            "border-t"
                          )}
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {ledgerLine.transaction.date}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {ledgerLine.type}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {ledgerLine.transaction.bookings
                              .filter((b) => b.id !== ledgerLine.id)
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
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {ledgerLine.transaction.note}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-500">
                            {ledgerLine.amount}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-500">
                            {ledgerLine.balance}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <a
                              href="./edit"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                              <span className="sr-only">
                                , {ledgerLine.transaction.date},{" "}
                                {ledgerLine.note}
                              </span>
                            </a>
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
    </div>
  );
}
