type Props = {
  amount: number;
  originalAmount?: number | null;
  currency?: string;
  className?: string;
};

export function PriceDisplay({ amount, originalAmount, currency = "TRY", className }: Props) {
  const formatted = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
  const showOriginal =
    typeof originalAmount === "number" &&
    Number.isFinite(originalAmount) &&
    originalAmount > amount;
  const formattedOriginal = showOriginal
    ? new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(originalAmount)
    : null;

  return (
    <span
      className={[
        "inline-flex items-baseline gap-2 rounded-2xl bg-emerald-50 px-3 py-1 text-lg font-semibold text-emerald-900 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-50 dark:ring-emerald-900/60",
        className ?? "",
      ].join(" ")}
    >
      {formattedOriginal ? (
        <span className="text-base font-semibold text-zinc-500 line-through dark:text-zinc-400">
          {formattedOriginal}
        </span>
      ) : null}
      {formatted}
    </span>
  );
}
