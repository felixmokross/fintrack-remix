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

export function hasErrors(errors: object) {
  return Object.values(errors).length > 0;
}

// useFetcher currently does not support automatic mapping to the serialzed type, and SerializeType is not exported, therefore copied this from Remix:
declare type JsonPrimitives =
  | string
  | number
  | boolean
  | String
  | Number
  | Boolean
  | null;
declare type NonJsonPrimitives = undefined | Function | symbol;
export declare type SerializeType<T> = T extends JsonPrimitives
  ? T
  : T extends NonJsonPrimitives
  ? never
  : T extends {
      toJSON(): infer U;
    }
  ? U
  : T extends []
  ? []
  : T extends [unknown, ...unknown[]]
  ? {
      [k in keyof T]: T[k] extends NonJsonPrimitives
        ? null
        : SerializeType<T[k]>;
    }
  : T extends (infer U)[]
  ? (U extends NonJsonPrimitives ? null : SerializeType<U>)[]
  : T extends object
  ? {
      [k in keyof T as T[k] extends NonJsonPrimitives
        ? never
        : k]: SerializeType<T[k]>;
    }
  : never;
