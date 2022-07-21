import type { ComponentPropsWithoutRef, ElementType } from "react";

export type PolymorphicComponentProps<T extends ElementType> = {
  as?: T;
} & ComponentPropsWithoutRef<T>;
