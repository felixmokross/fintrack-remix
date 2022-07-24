import { Decimal } from "@prisma/client/runtime";
import type { ComponentPropsWithoutRef, ElementType } from "react";

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

export function parseDecimal(balanceAtStart: string) {
  return new Decimal(balanceAtStart);
}
