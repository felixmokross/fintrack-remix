import { BookingType } from "@prisma/client";
import type {
  BookingValues,
  TransactionValues,
} from "../models/transactions.server";
import { validateTransaction } from "~/validation/transactions.server";

describe("validateTransaction", () => {
  it("does not return errors for a valid transaction", () => {
    const errors = validateTransaction(buildTransactionValues());

    expect(errors).toEqual({});
  });

  it("returns an error if less than two bookings", () => {
    const errors = validateTransaction(
      buildTransactionValues({ bookings: [buildBookingValues()] })
    );

    expect(errors).toEqual({ form: "Must have at least two bookings" });
  });
});

function buildTransactionValues(
  values: Partial<TransactionValues> = {}
): TransactionValues {
  return {
    date: "2020-01-01",
    bookings: [
      buildBookingValues({
        type: BookingType.CHARGE,
        accountId: "account-id",
        amount: "100",
      }),
      buildBookingValues({
        type: BookingType.EXPENSE,
        categoryId: "category-id",
        amount: "100",
      }),
    ],
    ...values,
  };
}

function buildBookingValues(
  values: Partial<BookingValues> = {}
): BookingValues {
  return {
    type: BookingType.EXPENSE,
    note: null,
    accountId: null,
    categoryId: "default-category-id",
    currency: "CHF",
    amount: "100",
    ...values,
  };
}
