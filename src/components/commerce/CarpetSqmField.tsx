"use client";

import { useRef, useTransition } from "react";
import { updateDraftField } from "@/app/actions/orderFlow";

type Props = {
  slug: string;
  defaultValue: string;
};

/** m² alanı — odak dışına çıkınca kaydeder (ayrı Güncelle butonu yok). */
export function CarpetSqmField({ slug, defaultValue }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const save = () => {
    const raw = ref.current?.value?.trim();
    if (raw === undefined || raw === "") return;
    startTransition(() => {
      const fd = new FormData();
      fd.set("slug", slug);
      fd.set("field", "sqm");
      fd.set("value", raw.replace(",", "."));
      void updateDraftField(fd);
    });
  };

  return (
    <div className="space-y-1">
      <input
        ref={ref}
        type="number"
        inputMode="decimal"
        min={1}
        step={0.5}
        defaultValue={defaultValue}
        onBlur={save}
        disabled={pending}
        className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none ring-emerald-500/40 focus:ring-4 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
      />
      {pending ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Kaydediliyor…</p>
      ) : null}
    </div>
  );
}
