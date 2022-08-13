import { useMatches } from "@remix-run/react";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { useMemo } from "react";

import type { User } from "~/models/users.server";

export const baseCurrency = "USD";

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

// inspired by Formik
export type FormErrors<Values> = {
  [K in keyof Values]?: Values[K] extends unknown[]
    ? Values[K][number] extends object
      ? FormErrors<Values[K][number]>[]
      : string
    : Values[K] extends object
    ? FormErrors<Values[K]>
    : string;
} & { form?: string };

export type PolymorphicComponentProps<T extends ElementType> = {
  as?: T;
} & ComponentPropsWithoutRef<T>;

export function getTitle(pageTitle?: string) {
  return pageTitle ? `${pageTitle} · Fintrack` : "Fintrack";
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
