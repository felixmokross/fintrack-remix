import type { Decimal } from "@prisma/client/runtime";
import { isToday, isTomorrow, isYesterday } from "date-fns";

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

  return getMoneyFormat(currency, style, locale).format(value.toNumber());
}

type CurrencyFormatStyle = "compact" | "normal" | "sign-always";

type CurrencyFormatCache = { locale?: string } & {
  [key in CurrencyFormatStyle]: Map<string, Intl.NumberFormat>;
};

const currencyFormatCache: CurrencyFormatCache = {
  locale: undefined,
  normal: new Map<string, Intl.NumberFormat>(),
  compact: new Map<string, Intl.NumberFormat>(),
  "sign-always": new Map<string, Intl.NumberFormat>(),
};

function getMoneyFormat(
  currency: string,
  style: CurrencyFormatStyle,
  locale: string
) {
  // TODO does not make sense server-side (multi-user)
  if (currencyFormatCache.locale !== locale) {
    currencyFormatCache.normal = new Map<string, Intl.NumberFormat>();
    currencyFormatCache.compact = new Map<string, Intl.NumberFormat>();
    currencyFormatCache["sign-always"] = new Map<string, Intl.NumberFormat>();
  }

  const cache = currencyFormatCache[style];

  const cachedFormat = cache.get(currency);
  if (cachedFormat) return cachedFormat;

  const format = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: style === "compact" ? 0 : undefined,
    signDisplay: style === "sign-always" ? "always" : undefined,
  });

  currencyFormatCache.locale = locale;
  cache.set(currency, format);

  return format;
}
