import { Decimal } from "@prisma/client/runtime";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
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
