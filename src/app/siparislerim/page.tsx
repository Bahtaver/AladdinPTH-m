import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Siparişlerim",
};

export default function SiparislerimPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Siparişlerim
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        Bu sayfa yakında aktif olacak.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
      >
        Alışverişe devam et
      </Link>
    </main>
  );
}
