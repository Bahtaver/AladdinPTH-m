import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kampanyalar",
};

export default function KampanyalarPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8 sm:py-10">
      <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Kampanyalar
      </h1>
      <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Yakında burada kampanya ve fırsatları paylaşacağız.
      </p>
    </main>
  );
}
