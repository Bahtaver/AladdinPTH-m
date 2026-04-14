import type { OrderDraft } from "@/lib/order/draftSchema";
import { goToStep } from "@/app/actions/orderFlow";

type Props = {
  slug: string;
  step: OrderDraft["step"];
};

const steps: { id: OrderDraft["step"]; label: string }[] = [
  { id: "configure", label: "Yapılandır" },
  { id: "address", label: "Adres" },
  { id: "review", label: "Özet" },
];

export function StepRail({ slug, step }: Props) {
  const idx = steps.findIndex((s) => s.id === step);

  return (
    <ol className="flex gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
      {steps.map((s, i) => {
        const done = i < idx;
        const active = s.id === step;
        return (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <form action={goToStep} className="w-full">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="step" value={s.id} />
              <button
                type="submit"
                className={[
                  "w-full rounded-full px-3 py-2 transition",
                  active
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : done
                      ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-50"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
                ].join(" ")}
              >
                {s.label}
              </button>
            </form>
          </li>
        );
      })}
    </ol>
  );
}
