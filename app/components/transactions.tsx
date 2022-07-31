import { Menu, Transition } from "@headlessui/react";
import { BookingType } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { Fragment, useReducer } from "react";
import { PencilIcon, PlusIcon } from "~/components/icons";
import { ChevronDownIcon, TrashIcon } from "~/components/icons";
import type { getAccountListItems } from "~/models/accounts.server";
import type { getIncomeExpenseCategoryListItems } from "~/models/income-expense-categories.server";
import type {
  getTransaction,
  TransactionValues,
} from "~/models/transactions.server";
import type { FormErrors, SerializeType } from "~/utils";
import { buttonClassName } from "./button";
import { cn } from "./classnames";
import { Combobox, CurrencyCombobox, Input } from "./forms";
import { Modal, ModalSize } from "./modal";

export type TransactionFormLoaderData = {
  accounts: Awaited<ReturnType<typeof getAccountListItems>>;
  incomeExpenseCategories: Awaited<
    ReturnType<typeof getIncomeExpenseCategoryListItems>
  >;
  transaction?: NonNullable<Awaited<ReturnType<typeof getTransaction>>>;
};

export type TransactionFormActionData = {
  ok: boolean;
  errors?: FormErrors<TransactionValues>;
  values?: TransactionValues;
};

export function TransactionFormModal({
  open,
  data: { accounts, incomeExpenseCategories, transaction },
  onClose,
  prefillAccountId,
}: TransactionFormModalProps) {
  const action = useFetcher<TransactionFormActionData>();
  useEffect(() => {
    if (action.type === "done" && action.data.ok) onClose();
  }, [action.type, action.data, onClose]);

  const [bookings, dispatch] = useReducer(
    bookingsReducer,
    transaction?.bookings.map((b) => ({ type: b.type })) || defaultBookings
  );

  const disabled = action.state !== "idle";
  return (
    <Modal open={open} onClose={onClose} size={ModalSize.EXTRA_LARGE}>
      <action.Form
        method="post"
        action={
          transaction
            ? `/transactions/${transaction.id}/edit`
            : "/transactions/new"
        }
      >
        <fieldset disabled={disabled}>
          <Modal.Body
            title={transaction ? "Edit Transaction" : "New Transaction"}
            icon={transaction ? PencilIcon : PlusIcon}
          >
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-12">
              <Input
                label="Date"
                name="date"
                type="date"
                defaultValue={
                  action.data?.values?.date || transaction?.date?.split("T")[0]
                }
                error={action.data?.errors?.date}
                groupClassName="sm:col-span-3"
              />
              <Input
                label="Note (optional)"
                name="note"
                defaultValue={
                  action.data?.values?.note || transaction?.note || undefined
                }
                error={action.data?.errors?.note}
                groupClassName="sm:col-span-6"
              />
              <div className="flex items-end sm:col-span-3">
                <AddBookingMenu dispatch={dispatch} />
              </div>
              <input
                type="hidden"
                value={bookings.length}
                name="bookingsCount"
              />
              {bookings.map(({ type }, index) => (
                <Fragment key={index}>
                  <input
                    type="hidden"
                    name={`bookings.${index}.type`}
                    value={type}
                  />
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
                      name={`bookings.${index}.accountId`}
                      defaultValue={
                        action.data?.values?.bookings[index]?.accountId ||
                        transaction?.bookings[index]?.accountId ||
                        (index === 0 && prefillAccountId) ||
                        undefined
                      }
                      error={action.data?.errors?.bookings?.[index]?.accountId}
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
                        name={`bookings.${index}.categoryId`}
                        defaultValue={
                          action.data?.values?.bookings[index]?.categoryId ||
                          transaction?.bookings[index]
                            ?.incomeExpenseCategoryId ||
                          undefined
                        }
                        error={
                          action.data?.errors?.bookings?.[index]?.categoryId
                        }
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
                        name={`bookings.${index}.currency`}
                        defaultValue={
                          action.data?.values?.bookings[index]?.currency ||
                          transaction?.bookings[index]?.currency ||
                          undefined
                        }
                        error={action.data?.errors?.bookings?.[index]?.currency}
                        groupClassName="sm:col-span-4"
                      />
                    </>
                  )}
                  <Input
                    label="Note"
                    name={`bookings.${index}.note`}
                    groupClassName="sm:col-span-2 sm:col-start-8"
                    defaultValue={
                      action.data?.values?.bookings[index]?.note ||
                      transaction?.bookings[index]?.note ||
                      undefined
                    }
                    error={action.data?.errors?.bookings?.[index]?.note}
                  />
                  <Input
                    label="Amount"
                    name={`bookings.${index}.amount`}
                    defaultValue={
                      action.data?.values?.bookings[index]?.amount ||
                      transaction?.bookings[index]?.amount
                    }
                    error={action.data?.errors?.bookings?.[index]?.amount}
                    groupClassName="sm:col-span-2"
                  />
                  <div className="flex items-center justify-end sm:col-span-1">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "remove", index })}
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
              {action.state !== "idle" ? "Saving…" : "Save"}
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
      </action.Form>
    </Modal>
  );
}

export type TransactionFormModalProps = {
  open: boolean;
  data: SerializeType<TransactionFormLoaderData>;
  onClose: () => void;
  prefillAccountId: string;
};

const defaultBookings: BookingsState = [
  { type: BookingType.CHARGE },
  { type: BookingType.EXPENSE },
];

function bookingsReducer(state: BookingsState, action: BookingsAction) {
  switch (action.type) {
    case "add":
      return state.concat({ type: action.bookingType });
    case "remove":
      return state.filter((_, i) => i !== action.index);
    default:
      throw new Error();
  }
}

type BookingsState = { type: BookingType }[];
type BookingsAction =
  | { type: "add"; bookingType: BookingType }
  | { type: "remove"; index: number };

function AddBookingMenu({ dispatch }: AddBookingMenuProps) {
  return (
    <Menu as="div" className="relative inline-block">
      <div>
        <Menu.Button className={buttonClassName()} type="button">
          Add booking
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
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
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <AddBookingMenuItem
              bookingType={BookingType.EXPENSE}
              label="Expense"
              dispatch={dispatch}
            />
            <AddBookingMenuItem
              bookingType={BookingType.INCOME}
              label="Income"
              dispatch={dispatch}
            />
            <AddBookingMenuItem
              bookingType={BookingType.CHARGE}
              label="Charge"
              dispatch={dispatch}
            />
            <AddBookingMenuItem
              bookingType={BookingType.DEPOSIT}
              label="Deposit"
              dispatch={dispatch}
            />
            <AddBookingMenuItem
              bookingType={BookingType.APPRECIATION}
              label="Appreciation"
              dispatch={dispatch}
            />
            <AddBookingMenuItem
              bookingType={BookingType.DEPRECIATION}
              label="Depreciation"
              dispatch={dispatch}
            />
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

function AddBookingMenuItem({
  bookingType,
  label,
  dispatch,
}: AddBookingMenuItemProps) {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          type="button"
          onClick={() =>
            dispatch({
              type: "add",
              bookingType,
            })
          }
          className={cn(
            active ? "bg-gray-100 text-gray-900" : "text-gray-700",
            "block w-full px-4 py-2 text-left text-sm"
          )}
        >
          {label}
        </button>
      )}
    </Menu.Item>
  );
}

type AddBookingMenuProps = {
  dispatch: (action: BookingsAction) => void;
};

type AddBookingMenuItemProps = {
  bookingType: BookingType;
  label: string;
  dispatch: (action: BookingsAction) => void;
};
