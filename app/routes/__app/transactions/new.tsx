import { Menu, Transition } from "@headlessui/react";
import { BookingType } from "@prisma/client";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useTransition,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import { Fragment, useReducer } from "react";
import invariant from "tiny-invariant";
import { ChevronDownIcon, PlusIcon, TrashIcon } from "~/icons";
import { getAccountListItems } from "~/models/account.server";
import { getIncomeExpenseCategoryListItems } from "~/models/income-expense-category.server";
import type {
  TransactionErrors,
  TransactionValues,
} from "~/models/transaction.server";
import {
  createTransaction,
  validateTransaction,
} from "~/models/transaction.server";
import { requireUserId } from "~/session.server";
import { Button } from "~/shared/button";
import { cn } from "~/shared/classnames";
import { Combobox, CurrencyCombobox, Input, Select } from "~/shared/forms";
import { Modal, ModalSize } from "~/shared/modal";
import { parseDate } from "~/shared/util";

type LoaderData = {
  accounts: Awaited<ReturnType<typeof getAccountListItems>>;
  incomeExpenseCategories: Awaited<
    ReturnType<typeof getIncomeExpenseCategoryListItems>
  >;
};

type ActionData = {
  errors?: TransactionErrors;
  values?: TransactionValues;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  return json<LoaderData>({
    accounts: await getAccountListItems({ userId }),
    incomeExpenseCategories: await getIncomeExpenseCategoryListItems({
      userId,
    }),
  });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const date = formData.get("date");
  const note = formData.get("note");

  invariant(typeof date === "string", "date not found");
  invariant(typeof note === "string", "note not found");

  const errors = validateTransaction({ date, note });

  if (Object.values(errors).length > 0) {
    return json<ActionData>(
      { errors, values: { date, note } },
      { status: 400 }
    );
  }

  await createTransaction({ date: parseDate(date), note, userId });

  return redirect(`/transactions`);
};

type State = { type: BookingType; id: number }[];
type Action =
  | { type: "add"; bookingType: BookingType }
  | { type: "remove"; id: number };
const initialState: State = [
  { type: BookingType.CHARGE, id: 1 },
  { type: BookingType.EXPENSE, id: 2 },
];

let nextBookingId = initialState.length + 1;

function reducer(state: State, action: Action) {
  switch (action.type) {
    case "add":
      return state.concat({ type: action.bookingType, id: nextBookingId++ });
    case "remove":
      return state.filter(({ id }) => id !== action.id);
    default:
      throw new Error();
  }
}

export default function NewTransactionModal() {
  const [bookings, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const actionData = useActionData<ActionData>();
  const { accounts, incomeExpenseCategories } = useLoaderData<LoaderData>();
  const { state } = useTransition();
  const disabled = state !== "idle";
  return (
    <Modal onClose={onClose} size={ModalSize.EXTRA_LARGE}>
      <Form method="post" replace>
        <fieldset disabled={disabled}>
          <Modal.Body title="New Transaction" icon={PlusIcon}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-12">
              <Input
                label="Date"
                name="date"
                type="date"
                error={actionData?.errors?.date}
                groupClassName="sm:col-span-3"
              />
              <Input
                label="Note (optional)"
                name="note"
                error={actionData?.errors?.note}
                groupClassName="sm:col-span-6"
              />
              <div className="flex items-end sm:col-span-3">
                <Menu as="div" className="relative inline-block">
                  <div>
                    <Menu.Button as={Button}>
                      Add booking
                      <ChevronDownIcon
                        className="-mr-1 ml-2 h-5 w-5"
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
                    <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() =>
                                dispatch({
                                  type: "add",
                                  bookingType: BookingType.EXPENSE,
                                })
                              }
                              className={cn(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block w-full px-4 py-2 text-left text-sm"
                              )}
                            >
                              Expense
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() =>
                                dispatch({
                                  type: "add",
                                  bookingType: BookingType.INCOME,
                                })
                              }
                              className={cn(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block w-full px-4 py-2 text-left text-sm"
                              )}
                            >
                              Income
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() =>
                                dispatch({
                                  type: "add",
                                  bookingType: BookingType.CHARGE,
                                })
                              }
                              className={cn(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block w-full px-4 py-2 text-left text-sm"
                              )}
                            >
                              Charge
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() =>
                                dispatch({
                                  type: "add",
                                  bookingType: BookingType.DEPOSIT,
                                })
                              }
                              className={cn(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block w-full px-4 py-2 text-left text-sm"
                              )}
                            >
                              Deposit
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() =>
                                dispatch({
                                  type: "add",
                                  bookingType: BookingType.APPRECIATION,
                                })
                              }
                              className={cn(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block w-full px-4 py-2 text-left text-sm"
                              )}
                            >
                              Appreciation
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() =>
                                dispatch({
                                  type: "add",
                                  bookingType: BookingType.DEPRECIATION,
                                })
                              }
                              className={cn(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block w-full px-4 py-2 text-left text-sm"
                              )}
                            >
                              Depreciation
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              {bookings.map(({ type, id }) => (
                <Fragment key={id}>
                  <div className="flex items-center sm:col-span-1 sm:col-start-1">
                    {type === BookingType.DEPOSIT && "DPT"}
                    {type === BookingType.CHARGE && "CHG"}
                    {type === BookingType.EXPENSE && "EXP"}
                    {type === BookingType.INCOME && "INC"}
                    {type === BookingType.APPRECIATION && "APR"}
                    {type === BookingType.DEPRECIATION && "DEP"}
                  </div>
                  {(type === BookingType.DEPOSIT ||
                    type === BookingType.CHARGE) && (
                    <Combobox
                      label="Account"
                      name="account"
                      groupClassName="sm:col-span-6"
                      options={accounts.map((a) => ({
                        primaryText: a.name,
                        value: a.id,
                      }))}
                    />
                  )}
                  {(type === BookingType.EXPENSE ||
                    type === BookingType.INCOME) && (
                    <>
                      <Combobox
                        label="Category"
                        name="categoryId"
                        groupClassName="sm:col-span-2"
                        options={incomeExpenseCategories
                          .filter((c) => c.type === type)
                          .map((c) => ({
                            primaryText: c.name,
                            value: c.id,
                          }))}
                      />
                      <CurrencyCombobox
                        label="Currency"
                        name="currency"
                        groupClassName="sm:col-span-4"
                      />
                    </>
                  )}
                  <Input
                    label="Note"
                    name="note"
                    groupClassName="sm:col-span-2 sm:col-start-8"
                  />
                  <Input
                    label="Amount"
                    name="amount"
                    groupClassName="sm:col-span-2"
                  />
                  <div className="flex items-center justify-end sm:col-span-1">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "remove", id })}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </Fragment>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Button type="submit" variant="primary">
              {state !== "idle" ? "Saving…" : "Save"}
            </Modal.Button>
            <Modal.Button
              type="button"
              onClick={onClose}
              className="mt-3 sm:mt-0"
            >
              Cancel
            </Modal.Button>
          </Modal.Footer>
        </fieldset>
      </Form>
    </Modal>
  );

  function onClose() {
    navigate(-1);
  }
}
