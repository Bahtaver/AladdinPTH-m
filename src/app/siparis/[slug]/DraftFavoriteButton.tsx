"use client";

import { toggleFavoriteFromOrderDraftForm } from "@/app/actions/favoritesActions";
import { HeartFill24, HeartStroke24 } from "@/components/icons/Heart24";

type Props = {
  slug: string;
  isFavorited: boolean;
  disabled: boolean;
};

export function DraftFavoriteButton({ slug, isFavorited, disabled }: Props) {
  return (
    <form action={toggleFavoriteFromOrderDraftForm} className="shrink-0">
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        disabled={disabled}
        className={[
          "flex size-11 items-center justify-center rounded-2xl border transition-colors disabled:pointer-events-none disabled:opacity-40",
          isFavorited
            ? "border-rose-400 bg-rose-500 text-white hover:bg-rose-600 dark:border-rose-500 dark:bg-rose-600 dark:hover:bg-rose-500"
            : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900/45 dark:bg-rose-950/35 dark:text-rose-300 dark:hover:bg-rose-950/55",
        ].join(" ")}
        aria-label={isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"}
      >
        {isFavorited ? (
          <HeartFill24 className="size-5 shrink-0" />
        ) : (
          <HeartStroke24 className="size-5 shrink-0" />
        )}
      </button>
    </form>
  );
}
