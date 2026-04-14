import Link from "next/link";

type PageProps = {
  searchParams: Promise<{ no?: string }>;
};

export default async function TesekkurlerPage({ searchParams }: PageProps) {
  const { no } = await searchParams;
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-6 px-4 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
        Sipariş alındı
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Teşekkürler
      </h1>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        Siparişiniz kaydedildi. Ekip planlaması için sizi arayacağız; adres ve
        tercih bilgileriniz operasyon ekibine iletildi.
      </p>
      {no ? (
        <p className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200">
          Referans: <span className="font-mono">{no}</span>
        </p>
      ) : null}
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
      >
        Ana sayfaya dön
      </Link>
    </main>
  );
}
