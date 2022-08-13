import { locale } from "~/utils";

export function Money({
  value,
  currency,
  showCompact = false,
}: {
  value: number;
  currency: string;
  showCompact?: boolean;
}) {
  const formattedValue = getFormat(currency, showCompact).format(value);
  return <>{formattedValue}</>;
}

const currencyFormatCache = {
  normal: new Map<string, Intl.NumberFormat>(),
  compact: new Map<string, Intl.NumberFormat>(),
};

function getFormat(currency: string, showCompact: boolean) {
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

  cache.set(currency, format);

  return format;
}
