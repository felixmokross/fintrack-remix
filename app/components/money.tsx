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
  const formattedValue = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: showCompact ? 0 : undefined,
  }).format(value);
  return <>{formattedValue}</>;
}
