import Image from "next/image";
import { updateDraftField } from "@/app/actions/orderFlow";

type Props = {
  slug: string;
  field: string;
  value: string;
  label: string;
  imageUrl: string | null;
  selected: boolean;
};

/** Küçük görsel + etiket; form ile `updateDraftField` gönderir. */
export function VisualChoiceCard({
  slug,
  field,
  value,
  label,
  imageUrl,
  selected,
}: Props) {
  return (
    <form action={updateDraftField} className="h-full min-w-0">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={value} />
      <button
        type="submit"
        className={[
          "flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border text-left transition",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600",
          selected
            ? "border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-500/25 dark:border-emerald-500 dark:bg-emerald-950/50 dark:ring-emerald-400/20"
            : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600",
        ].join(" ")}
      >
        <span className="relative block aspect-[5/4] w-full bg-zinc-100 dark:bg-zinc-900">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="(max-width:640px) 30vw, 140px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="flex h-full min-h-[4.5rem] items-center justify-center text-[10px] text-zinc-400">
              Görsel
            </span>
          )}
        </span>
        <span className="px-2 py-2 text-center text-xs font-medium leading-snug text-zinc-800 dark:text-zinc-100">
          {label}
        </span>
      </button>
    </form>
  );
}
