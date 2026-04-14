import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServiceCardCoverPath } from "@/config/homeServiceCardMedia";
import { loadFavoritesWithServices } from "@/lib/data/favoritesRepository";
import { publicServiceAssetUrl } from "@/lib/storage/serviceAssetUrl";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Favorilerim",
};

export default async function FavorilerPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const rows = await loadFavoritesWithServices(supabase, user.id);

  return (
    <main className="mx-auto max-w-lg px-4 py-8 sm:py-10">
      <header className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="text-xs font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300"
        >
          ← Ana sayfa
        </Link>
        <h1 className="text-sm font-semibold tracking-tight">Favorilerim</h1>
        <Link
          href="/sepet"
          className="text-xs font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          Sepetim
        </Link>
      </header>

      <p className="mb-5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        Kaydettiğiniz hizmetler burada listelenir; en son güncellediğiniz üstte. Sepetten çıkmaz — yalnızca
        kalp ile eklenir veya güncellenir. Silmek için sepette çöp kutusunu kullanın.
      </p>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Henüz favori yok.</p>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Sepetteki bir kalemde kalp simgesine dokunarak buraya ekleyebilirsiniz.
          </p>
          <Link
            href="/sepet"
            className="mt-5 inline-flex w-full justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Sepetime git
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const slug = row.services?.slug ?? "";
            const coverPath = getServiceCardCoverPath(
              slug,
              row.services?.cover_image_path ?? null,
            );
            const imgUrl = publicServiceAssetUrl(coverPath);
            const title =
              row.display_title?.trim() || row.services?.name?.trim() || "Hizmet";
            const href = slug ? `/siparis/${encodeURIComponent(slug)}` : "/";
            return (
              <li
                key={row.id}
                className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-700">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt=""
                      fill
                      className="object-contain object-center"
                      sizes="56px"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[10px] text-zinc-500">
                      —
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{title}</p>
                  {slug ? (
                    <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{slug}</p>
                  ) : null}
                  <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                    Güncellendi:{" "}
                    {new Date(row.updated_at).toLocaleString("tr-TR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <Link
                  href={href}
                  className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:bg-emerald-950/70"
                >
                  Sipariş
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
