import { goToStep } from "@/app/actions/orderFlow";

type Props = {
  slug: string;
  label: string;
  nextStep: "address" | "review";
  disabled?: boolean;
};

export function ContinueBar({ slug, label, nextStep, disabled }: Props) {
  if (disabled) {
    return (
      <p className="text-sm text-amber-700 dark:text-amber-300">
        Devam etmek için seçimleri tamamlayın.
      </p>
    );
  }
  return (
    <form action={goToStep} className="pt-4">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="step" value={nextStep} />
      <button
        type="submit"
        className="w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        {label}
      </button>
    </form>
  );
}
