import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  addProfilePhoneEntry,
  addProfileSavedAddress,
  deleteProfilePhoneEntry,
  deleteProfileSavedAddress,
  saveProfileBasics,
} from "@/app/actions/profileActions";
import {
  AccordionIconAccount,
  AccordionIconHome,
  AccordionIconMail,
  AccordionIconPhone,
  AccordionIconProfile,
  ProfileAccordion,
} from "@/app/profil/ProfileAccordion";
import { ProfileUpgradeCard } from "@/app/profil/ProfileUpgradeCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CustomerAddressRow,
  ProfilePhoneBookRow,
  ProfileRow,
} from "@/types/database";

export const metadata: Metadata = {
  title: "Profilim",
};

function isAnonymousUser(user: { is_anonymous?: boolean } | null): boolean {
  return Boolean(user && user.is_anonymous === true);
}

export default async function ProfilPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, phone, contact_email")
    .eq("id", user.id)
    .maybeSingle();

  const { data: phonesRaw } = await supabase
    .from("profile_phone_book")
    .select("id, label, phone, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const { data: addressesRaw } = await supabase
    .from("customer_addresses")
    .select("id, label, address_line, created_at")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: true });

  const p = (profile ?? null) as ProfileRow | null;
  const phones = (phonesRaw ?? []) as ProfilePhoneBookRow[];
  const addresses = (addressesRaw ?? []) as CustomerAddressRow[];
  const authEmail = user.email?.trim() ?? "";
  const guest = isAnonymousUser(user);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/"
            className="text-xs font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300"
          >
            ← Ana sayfa
          </Link>
          <h1 className="text-sm font-semibold tracking-tight">Profilim</h1>
          <span className="w-12" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-3 px-4 py-5">
        <ProfileAccordion
          title="Hesap ve doğrulama"
          closedHint="Misafir oturumu, hesabı yükseltme ve sipariş doğrulaması (ayrı akış)."
          icon={<AccordionIconAccount className="size-7 sm:size-8" />}
          initiallyOpen={guest}
        >
          <ProfileUpgradeCard isAnonymous={guest} />
        </ProfileAccordion>

        <ProfileAccordion
          title="Genel bilgiler"
          closedHint="Ad, telefon ve opsiyonel iletişim e-postası — sipariş formundan bağımsız."
          icon={<AccordionIconProfile className="size-7 sm:size-8" />}
        >
          <div className="mb-4 flex gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50 px-4 py-3.5 dark:border-zinc-700 dark:bg-zinc-900/50 sm:px-4 sm:py-4">
            <span className="flex size-10 shrink-0 items-center justify-center self-start rounded-lg bg-white text-emerald-700 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-950 dark:text-emerald-400 dark:ring-zinc-800">
              <AccordionIconProfile className="size-5" />
            </span>
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              Sipariş formundaki bilgiler otomatik buraya gelmez; isterseniz buradan
              kaydedip siparişte kullanırsınız.
            </p>
          </div>
          <div className="mb-4 flex gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50 px-4 py-3.5 dark:border-zinc-700 dark:bg-zinc-900/50 sm:py-4">
            <span className="flex size-10 shrink-0 items-center justify-center self-start rounded-lg bg-white text-emerald-700 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-950 dark:text-emerald-400 dark:ring-zinc-800">
              <AccordionIconMail className="size-5" />
            </span>
            <div className="min-w-0 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                Oturum e-postası (doğrulama)
              </span>
              <p className="mt-1 break-all font-mono text-sm text-zinc-700 dark:text-zinc-200">
                {authEmail ? (
                  authEmail
                ) : (
                  <span className="font-sans text-zinc-500">— (misafir / tanımlı değil)</span>
                )}
              </p>
            </div>
          </div>
          <form action={saveProfileBasics} className="space-y-3">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
              Görünen ad
              <input
                name="full_name"
                defaultValue={p?.full_name ?? ""}
                placeholder="Ad Soyad"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500/30 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
              Sık kullandığınız telefon
              <input
                name="phone"
                defaultValue={p?.phone ?? ""}
                placeholder="05xx…"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500/30 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">
              İletişim e-postası (opsiyonel)
              <input
                name="contact_email"
                type="email"
                defaultValue={p?.contact_email ?? ""}
                placeholder="ornek@posta.com"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500/30 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-950"
              />
              <span className="mt-1 block text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Operasyonun sizi araması için; sipariş öncesi e-posta doğrulaması
                ayrıdır.
              </span>
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Kaydet
            </button>
          </form>
        </ProfileAccordion>

        <ProfileAccordion
          title="Kayıtlı adresler"
          closedHint="Siparişte hızlı seçim için; en fazla 12 kayıt. Satıra dokunun."
          icon={<AccordionIconHome className="size-7 sm:size-8" />}
          count={addresses.length}
        >
          <div className="mb-4 flex gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50 px-4 py-3.5 dark:border-zinc-700 dark:bg-zinc-900/50 sm:py-4">
            <span className="flex size-10 shrink-0 items-center justify-center self-start rounded-lg bg-white text-emerald-700 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-950 dark:text-emerald-400 dark:ring-zinc-800">
              <AccordionIconHome className="size-5" />
            </span>
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              Ev, işyeri vb. Sipariş adımında listeden seçebilir veya buradan
              kopyalayabilirsiniz.
            </p>
          </div>
          <ul className="space-y-2">
            {addresses.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {row.label?.trim() ? row.label : "Adres"}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                      {row.address_line}
                    </p>
                  </div>
                  <form action={deleteProfileSavedAddress}>
                    <input type="hidden" name="id" value={row.id} />
                    <button
                      type="submit"
                      className="shrink-0 rounded-lg border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-950"
                    >
                      Sil
                    </button>
                  </form>
                </div>
              </li>
            ))}
            {addresses.length === 0 ? (
              <li className="text-xs text-zinc-500">Henüz kayıtlı adres yok.</li>
            ) : null}
          </ul>
          <form
            action={addProfileSavedAddress}
            className="mt-4 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800"
          >
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
              Yeni adres
            </p>
            <input
              name="label"
              placeholder="Etiket (örn. Ev, İş) — isteğe bağlı"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <textarea
              name="address_line"
              required
              rows={4}
              minLength={5}
              placeholder="Mahalle, sokak, bina, daire, yön tarifi…"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              type="submit"
              className="w-full rounded-xl border border-emerald-600 bg-emerald-50 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:bg-emerald-950/60"
            >
              Adres ekle
            </button>
          </form>
        </ProfileAccordion>

        <ProfileAccordion
          title="Kayıtlı telefonlar"
          closedHint="Ek iletişim hatları (örn. aile); en fazla 15. Satıra dokunun."
          icon={<AccordionIconPhone className="size-7 sm:size-8" />}
          count={phones.length}
        >
          <div className="mb-4 flex gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50 px-4 py-3.5 dark:border-zinc-700 dark:bg-zinc-900/50 sm:py-4">
            <span className="flex size-10 shrink-0 items-center justify-center self-start rounded-lg bg-white text-emerald-700 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-950 dark:text-emerald-400 dark:ring-zinc-800">
              <AccordionIconPhone className="size-5" />
            </span>
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              Siparişteki telefon alanından bağımsız; teslimatta aranacak ek
              numaralar için.
            </p>
          </div>
          <ul className="space-y-2">
            {phones.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {row.label}
                  </p>
                  <p className="font-mono text-xs text-zinc-600 dark:text-zinc-300">
                    {row.phone}
                  </p>
                </div>
                <form action={deleteProfilePhoneEntry}>
                  <input type="hidden" name="id" value={row.id} />
                  <button
                    type="submit"
                    className="shrink-0 rounded-lg border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-950"
                  >
                    Sil
                  </button>
                </form>
              </li>
            ))}
            {phones.length === 0 ? (
              <li className="text-xs text-zinc-500">Henüz kayıtlı numara yok.</li>
            ) : null}
          </ul>
          <form
            action={addProfilePhoneEntry}
            className="mt-4 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800"
          >
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
              Yeni numara
            </p>
            <input
              name="label"
              required
              placeholder="Etiket (örn. Annem)"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <input
              name="phone"
              required
              minLength={5}
              placeholder="Telefon"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              type="submit"
              className="w-full rounded-xl border border-emerald-600 bg-emerald-50 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:bg-emerald-950/60"
            >
              Numara ekle
            </button>
          </form>
        </ProfileAccordion>
      </main>
    </div>
  );
}
