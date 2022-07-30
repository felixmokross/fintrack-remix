import { Decimal } from "@prisma/client/runtime";
import type { ComponentPropsWithoutRef, ElementType } from "react";

// inspired by Formik
export type FormErrors<Values> = {
  [K in keyof Values]?: Values[K] extends unknown[]
    ? Values[K][number] extends object
      ? FormErrors<Values[K][number]>[]
      : string
    : Values[K] extends object
    ? FormErrors<Values[K]>
    : string;
};

export type PolymorphicComponentProps<T extends ElementType> = {
  as?: T;
} & ComponentPropsWithoutRef<T>;

export function getTitle(pageTitle?: string) {
  return pageTitle ? `${pageTitle} · Fintrack` : "Fintrack";
}

export function parseDate(date: string) {
  return new Date(date);
}

export function isValidDate(date: string) {
  return !isNaN(parseDate(date).valueOf());
}

export function parseDecimal(value: string) {
  return new Decimal(value);
}
