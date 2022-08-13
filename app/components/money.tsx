export function Money({
  value,
  currency,
  showCompact = false,
  locale,
}: {
  value: number;
  currency: string;
  showCompact?: boolean;
  locale: string;
}) {
  const formattedValue = getFormat(currency, showCompact, locale).format(value);
  return <>{formattedValue}</>;
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

function getFormat(currency: string, showCompact: boolean, locale: string) {
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
