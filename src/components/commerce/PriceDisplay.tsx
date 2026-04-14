type Props = {
  amount: number;
  currency?: string;
  className?: string;
};

export function PriceDisplay({ amount, currency = "TRY", className }: Props) {
  const formatted = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <span
      className={[
        "inline-flex items-baseline gap-1 rounded-2xl bg-emerald-50 px-3 py-1 text-lg font-semibold text-emerald-900 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-50 dark:ring-emerald-900/60",
        className ?? "",
      ].join(" ")}
    >
      {formatted}
    </span>
  );
}
