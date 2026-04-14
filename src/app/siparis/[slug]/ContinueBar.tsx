import { goToStep } from "@/app/actions/orderFlow";

type Props = {
  slug: string;
  label: string;
  nextStep: "address" | "review";
  disabled?: boolean;
  /** Düğmenin altında gösterilen kısa yönlendirme. */
  hint?: string;
};

export function ContinueBar({ slug, label, nextStep, disabled, hint }: Props) {
  if (disabled) {
    return (
      <p className="pt-4 text-sm text-amber-800 dark:text-amber-200">
        Tüm seçimleri tamamladıktan sonra ilerleyebilirsiniz.
      </p>
    );
  }
  return (
    <div className="space-y-2 pt-4">
      <form action={goToStep}>
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="step" value={nextStep} />
        <button
          type="submit"
          className="w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {label}
        </button>
      </form>
      {hint ? (
        <p className="text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
