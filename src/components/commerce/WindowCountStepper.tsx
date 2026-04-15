import { updateDraftField } from "@/app/actions/orderFlow";

type Props = {
  slug: string;
  count: number;
};

/** Sunucu aksiyonu ile Güncelle butonu olmadan adet değiştirir. */
export function WindowCountStepper({ slug, count }: Props) {
  const safe = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
  const nextDec = Math.max(0, safe - 1);
  const nextInc = safe + 1;
  const btn =
    "flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-lg font-semibold text-zinc-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/80 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/40";

  return (
    <div className="flex flex-wrap items-center gap-4">
      <form action={updateDraftField} className="inline">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="field" value="window_count" />
        <input type="hidden" name="value" value={String(nextDec)} />
        <button type="submit" disabled={safe <= 0} className={btn} aria-label="Bir azalt">
          −
        </button>
      </form>
      <span className="min-w-[2.5rem] text-center text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
        {safe}
      </span>
      <form action={updateDraftField} className="inline">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="field" value="window_count" />
        <input type="hidden" name="value" value={String(nextInc)} />
        <button type="submit" className={btn} aria-label="Bir artır">
          +
        </button>
      </form>
    </div>
  );
}
