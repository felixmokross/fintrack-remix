import type { Decimal } from "@prisma/client/runtime";
import { isToday, isTomorrow, isYesterday } from "date-fns";
import { cache } from "./cache.server";

export function formatDate(value: Date, locale: string) {
  if (isTomorrow(value)) return "Tomorrow";
  if (isToday(value)) return "Today";
  if (isYesterday(value)) return "Yesterday";

  return getDateFormat(locale).format(value);
}

type DateFormatCache = {
  locale: string;
  format: Intl.DateTimeFormat;
};
let dateFormatCache: DateFormatCache | null = null;

function getDateFormat(locale: string) {
  if (dateFormatCache && dateFormatCache.locale === locale)
    return dateFormatCache.format;

  const format = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  dateFormatCache = { locale, format };

  return format;
}

export function formatMoney(
  value: Decimal,
  currency: string | null,
  locale: string,
  style: CurrencyFormatStyle = "normal"
) {
  if (!currency) return value.toString();

  return getMoneyFormat(locale, currency, style).format(value.toNumber());
}

export type CurrencyFormatStyle = "compact" | "normal" | "sign-always";

function getMoneyFormat(
  locale: string,
  currency: string,
  style: CurrencyFormatStyle
) {
  const cachedFormat = cache.currencyFormat.read(locale, currency, style);
  if (cachedFormat) return cachedFormat;

  const format = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: style === "compact" ? 0 : undefined,
    signDisplay: style === "sign-always" ? "always" : undefined,
  });

  cache.currencyFormat.write(locale, currency, style, format);
  return format;
}
