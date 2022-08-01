import { BookingType } from "@prisma/client";
import type {
  TransactionValues,
  BookingValues,
} from "~/models/transactions.server";
import type { FormErrors } from "~/utils";
import { isValidDate, isValidDecimal, sum } from "~/utils.server";

export function validateTransaction({ date, bookings }: TransactionValues) {
  const errors: FormErrors<TransactionValues> = {};

  if (date.length === 0) errors.date = "Date is required";
  else if (!isValidDate(date)) errors.date = "Date must be a date";

  if (bookings.length < 2) errors.form = "Must have at least two bookings";
  else if (allBookingsHaveValidAmounts(bookings)) {
    const transactionBalance = getTransactionBalance(bookings);

    if (!transactionBalance.isZero())
      errors.form = `Transaction is not balanced by ${transactionBalance.toString()}`;
  }

  errors.bookings = bookings.map(validateBooking);

  if (errors.bookings.every((b) => Object.values(b).length === 0))
    delete errors.bookings;

  return errors;
}

function allBookingsHaveValidAmounts(bookings: BookingValues[]) {
  return bookings.every((b) => isValidDecimal(b.amount));
}

function getTransactionBalance(bookings: BookingValues[]) {
  return sum(
    bookings
      .filter(
        (b) =>
          b.type === BookingType.DEPOSIT ||
          b.type === BookingType.EXPENSE ||
          b.type === BookingType.DEPRECIATION
      )
      .map((b) => b.amount)
  ).sub(
    sum(
      bookings
        .filter(
          (b) =>
            b.type === BookingType.CHARGE ||
            b.type === BookingType.INCOME ||
            b.type === BookingType.APPRECIATION
        )
        .map((b) => b.amount)
    )
  );
}

function validateBooking(booking: BookingValues) {
  switch (booking.type) {
    case BookingType.DEPOSIT:
    case BookingType.CHARGE:
      return validateDepositCharge(booking);
    case BookingType.INCOME:
    case BookingType.EXPENSE:
      return validateIncomeExpense(booking);
    case BookingType.APPRECIATION:
    case BookingType.DEPRECIATION:
      return validateCommonBookingValues(booking);
    default:
      throw new Error();
  }
}

function validateDepositCharge({ accountId, amount }: BookingValues) {
  const errors: FormErrors<BookingValues> = validateCommonBookingValues({
    amount,
  });

  if (!accountId) {
    errors.accountId = "Account is required";
  }

  return errors;
}

function validateIncomeExpense({
  categoryId,
  currency,
  amount,
}: BookingValues) {
  const errors: FormErrors<BookingValues> = validateCommonBookingValues({
    amount,
  });

  if (!categoryId) {
    errors.categoryId = "Category is required";
  }

  if (!currency) {
    errors.currency = "Currency is required";
  }

  return errors;
}

function validateCommonBookingValues({
  amount,
}: Pick<BookingValues, "amount">) {
  const errors: FormErrors<BookingValues> = {};
  if (!amount) {
    errors.amount = "Amount is required";
  } else if (!isValidDecimal(amount)) {
    errors.amount = "Amount must be a number";
  }
  return errors;
}
