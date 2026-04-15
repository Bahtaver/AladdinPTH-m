import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Siparişleriniz alındı",
};

type PageProps = {
  searchParams: Promise<{ no?: string }>;
};

const uuidish =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function SepetTesekkurlerPage({ searchParams }: PageProps) {
  const { no: noRaw } = await searchParams;
  const raw = typeof noRaw === "string" ? noRaw.trim() : "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => uuidish.test(s));
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const serviceTitlesByOrderId = new Map<string, string>();
  if (user && ids.length > 0) {
    const { data: rows } = await supabase
      .from("orders")
      .select("id, services(name)")
      .eq("customer_id", user.id)
      .in("id", ids);
    for (const row of rows ?? []) {
      const rec = row as { id?: string; services?: { name?: string } | null };
      if (rec.id) {
        serviceTitlesByOrderId.set(rec.id, rec.services?.name?.trim() || "Hizmet");
      }
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
        Sepet checkout
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Siparişleriniz alındı
      </h1>
      <p className="mt-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-200">
        Başarıyla kaydedildi ve planlamaya alındı
      </p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        Seçtiğiniz hizmetler planlama sistemine alındı. Ekipleriniz adres bilgisine göre organize
        edilecektir. Ekip yola çıkmadan önce size haber verecek.
      </p>

      {ids.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-50">
          Sipariş numaraları bulunamadı. Ana sayfaya dönüp{" "}
          <Link href="/profil" className="font-medium underline-offset-2 hover:underline">
            Profilim
          </Link>{" "}
          üzerinden kayıtlarınızı kontrol edebilirsiniz.
        </p>
      ) : serviceTitlesByOrderId.size === 0 ? (
        <ul className="mt-8 space-y-3">
          {ids.map((id) => (
            <li
              key={id}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-mono text-xs text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 sm:text-sm"
            >
              {id}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-8 space-y-3">
          {ids.map((id) => (
            <li
              key={id}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              {serviceTitlesByOrderId.get(id) ?? "Hizmet"}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex flex-1 justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Alışverişe devam et
        </Link>
        <Link
          href="/siparislerim"
          className="inline-flex flex-1 justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 hover:border-emerald-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        >
          Siparişlerim
        </Link>
      </div>
    </main>
  );
}
