"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { addOrderDraftToCart } from "@/app/actions/cartActions";
import { saveFulfillment } from "@/app/actions/orderFlow";
import type { OrderDraft } from "@/lib/order/draftSchema";
import type { CustomerAddressRow } from "@/types/database";
import { CartBag24 } from "@/components/icons/CartBag24";
import { ChevronRight24 } from "@/components/icons/ChevronRight24";
import { DraftFavoriteButton } from "./DraftFavoriteButton";

type Props = {
  slug: string;
  draft: OrderDraft;
  savedAddresses: CustomerAddressRow[];
  showFavorite: boolean;
  isFavorited: boolean;
  canFavorite: boolean;
};

export function AddressSection({
  slug,
  draft,
  savedAddresses,
  showFavorite,
  isFavorited,
  canFavorite,
}: Props) {
  const f = draft.fulfillment ?? {};
  const [fullName, setFullName] = useState(() => f.full_name ?? "");
  const [phone, setPhone] = useState(() => f.phone ?? "");
  const [addressLine, setAddressLine] = useState(() => f.address_line ?? "");
  const [timeWindow, setTimeWindow] = useState(() => f.time_window_preference ?? "");
  const [customerNote, setCustomerNote] = useState(() => f.customer_note ?? "");
  const [pickerKey, setPickerKey] = useState(0);

  const addressOptions = useMemo(
    () =>
      savedAddresses.map((a) => ({
        id: a.id,
        title: a.label?.trim() ? a.label.trim() : "Adres",
        line: a.address_line,
      })),
    [savedAddresses],
  );

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <form id="siparis-address-form" action={saveFulfillment} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />
      {addressOptions.length > 0 ? (
        <div className="space-y-1 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <label className="block text-sm font-medium text-emerald-950 dark:text-emerald-100">
            Kayıtlı adreslerden seç
          </label>
          <select
            key={pickerKey}
            defaultValue=""
            className="mt-1 w-full rounded-2xl border border-emerald-200/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-500/30 focus:ring-4 dark:border-emerald-800 dark:bg-zinc-950 dark:text-zinc-50"
            onChange={(e) => {
              const id = e.target.value;
              if (!id) return;
              const row = addressOptions.find((o) => o.id === id);
              if (row) {
                const prefix = row.title !== "Adres" ? `[${row.title}]\n` : "";
                setAddressLine(prefix + row.line);
              }
              setPickerKey((k) => k + 1);
            }}
          >
            <option value="">— Bir adres seçin (metin alanına yazılır) —</option>
            {addressOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80">
            İsterseniz seçtikten sonra metni düzenleyebilirsiniz. Yeni adres kaydetmek için{" "}
            <Link
              href="/profil"
              className="font-medium underline-offset-2 hover:underline"
            >
              Profilim
            </Link>
            .
          </p>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
          Kayıtlı adresiniz yok. Sık kullandığınız adresleri{" "}
          <Link href="/profil" className="font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-300">
            Profilim
          </Link>{" "}
          üzerinden ekleyebilirsiniz.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm text-zinc-700 dark:text-zinc-200">
          Ad soyad
          <input
            name="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 outline-none ring-emerald-500/40 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>
        <label className="space-y-1 text-sm text-zinc-700 dark:text-zinc-200">
          Telefon
          <input
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 outline-none ring-emerald-500/40 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>
      </div>
      <label className="block space-y-1 text-sm text-zinc-700 dark:text-zinc-200">
        Hizmet adresi
        <textarea
          name="address_line"
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          required
          rows={4}
          className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 outline-none ring-emerald-500/40 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </label>
      <label className="block space-y-1 text-sm text-zinc-700 dark:text-zinc-200">
        Zaman tercihi (isteğe bağlı)
        <select
          name="time_window_preference"
          value={timeWindow}
          onChange={(e) => setTimeWindow(e.target.value)}
          aria-label="Zaman tercihi"
          className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 outline-none ring-emerald-500/40 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        >
          <option value="">Esnek — ekip gün içi arar</option>
          <option value="morning">Sabah</option>
          <option value="afternoon">Öğleden sonra</option>
          <option value="evening">Akşamüstü</option>
          <option value="flexible">Tamamen esnek</option>
        </select>
      </label>
      <label className="block space-y-1 text-sm text-zinc-700 dark:text-zinc-200">
        Not (isteğe bağlı)
        <textarea
          name="customer_note"
          value={customerNote}
          onChange={(e) => setCustomerNote(e.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 outline-none ring-emerald-500/40 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </label>
      <input type="hidden" name="draft_source" value="address" />
      </form>
      <div className="flex gap-2">
        {showFavorite ? (
          <DraftFavoriteButton
            slug={slug}
            isFavorited={isFavorited}
            disabled={!canFavorite}
          />
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <button
            type="submit"
            form="siparis-address-form"
            formAction={addOrderDraftToCart}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm hover:border-emerald-300 hover:bg-emerald-50/80 dark:border-emerald-800 dark:bg-zinc-950 dark:text-emerald-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
          >
            <CartBag24 className="size-5 shrink-0" />
            Sepete ekle
          </button>
          <button
            type="submit"
            form="siparis-address-form"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
          >
            Özeti gör
            <ChevronRight24 className="size-5 shrink-0 opacity-90" />
          </button>
        </div>
      </div>
    </div>
  );
}
