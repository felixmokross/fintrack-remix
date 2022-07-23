import type { ComponentPropsWithoutRef, ElementType } from "react";

export type PolymorphicComponentProps<T extends ElementType> = {
  as?: T;
} & ComponentPropsWithoutRef<T>;

export function getTitle(pageTitle?: string) {
  return pageTitle ? `${pageTitle} · Fintrack` : "Fintrack";
}
