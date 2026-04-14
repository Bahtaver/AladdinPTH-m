type Trust = { title?: string; body?: string };

export function TrustPanel({ trust }: { trust: Trust | null }) {
  if (!trust?.title && !trust?.body) return null;
  return (
    <aside className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-950 ring-1 ring-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-50 dark:ring-emerald-900/40">
      {trust.title ? (
        <p className="font-semibold tracking-tight">{trust.title}</p>
      ) : null}
      {trust.body ? (
        <p className="mt-2 whitespace-pre-line leading-relaxed text-emerald-900/90 dark:text-emerald-100/90">
          {trust.body}
        </p>
      ) : null}
    </aside>
  );
}
