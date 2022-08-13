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
  compact = false
) {
  if (!currency) return value.toString();

  return getMoneyFormat(currency, compact, locale).format(value.toNumber());
}

type CurrencyFormatCache = {
  locale?: string;
  normal: Map<string, Intl.NumberFormat>;
  compact: Map<string, Intl.NumberFormat>;
};

const currencyFormatCache: CurrencyFormatCache = {
  locale: undefined,
  normal: new Map<string, Intl.NumberFormat>(),
  compact: new Map<string, Intl.NumberFormat>(),
};

function getMoneyFormat(
  currency: string,
  showCompact: boolean,
  locale: string
) {
  if (currencyFormatCache.locale !== locale) {
    currencyFormatCache.normal = new Map<string, Intl.NumberFormat>();
    currencyFormatCache.compact = new Map<string, Intl.NumberFormat>();
  }

  const cache = showCompact
    ? currencyFormatCache.compact
    : currencyFormatCache.normal;

  const cachedFormat = cache.get(currency);
  if (cachedFormat) return cachedFormat;

  const format = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: showCompact ? 0 : undefined,
  });

  currencyFormatCache.locale = locale;
  cache.set(currency, format);

  return format;
}
