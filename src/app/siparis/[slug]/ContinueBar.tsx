import { goToStep } from "@/app/actions/orderFlow";
import { ChevronRight24 } from "@/components/icons/ChevronRight24";

export type ContinueSelectionStatus = "empty" | "incomplete" | "complete";

type Props = {
  slug: string;
  label: string;
  nextStep: "address" | "review";
  disabled?: boolean;
  selectionStatus: ContinueSelectionStatus;
};

function selectionStatusText(selectionStatus: ContinueSelectionStatus): string {
  if (selectionStatus === "empty") return "Seçim yaparak başlayın";
  if (selectionStatus === "incomplete") return "Devam etmek için seçimleri tamamlayın";
  return "Tamamlamanıza 1 adım kaldı";
}

export function ContinueBar({ slug, label, nextStep, disabled, selectionStatus }: Props) {
  if (disabled) {
    return (
      <p className="pt-4 text-sm text-amber-800 dark:text-amber-200">
        {selectionStatusText(selectionStatus)}
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {label}
          <ChevronRight24 className="size-5 shrink-0 opacity-90" />
        </button>
      </form>
    </div>
  );
}
