"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { submitCartCheckout } from "@/app/actions/cartActions";
import { SmartAddressField } from "@/components/address/SmartAddressField";
import { OrderVerificationGate } from "@/components/auth/OrderVerificationGate";
import { PriceDisplay } from "@/components/commerce/PriceDisplay";
import { CHECKOUT_VERIFICATION_ENABLED } from "@/lib/auth/checkoutVerification";
import type { PriceQuote } from "@/lib/pricing/engine";
import type { CustomerAddressRow } from "@/types/database";

export type CartCheckoutLine = {
  id: string;
  serviceName: string;
  quote: PriceQuote;
};

type Props = {
  /** Üstteki `cart_item_id` kutularının `form` ile bağlanacağı `<form id="…">` (doğrulama kapısındayken verilmez). */
  formId?: string;
  lines: CartCheckoutLine[];
  savedAddresses: CustomerAddressRow[];
  profileDefaults: { full_name: string; phone: string };
  needsAuthVerification: boolean;
};

export function CartCheckoutForm({
  formId,
  lines,
  savedAddresses,
  profileDefaults,
  needsAuthVerification,
}: Props) {
  const [fullName, setFullName] = useState(() => profileDefaults.full_name);
  const [phone, setPhone] = useState(() => profileDefaults.phone);
  const [addressLine, setAddressLine] = useState("");
  const [timeWindow, setTimeWindow] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const grand = useMemo(() => {
    const currency = lines[0]?.quote.currency ?? "TRY";
    const total = lines.reduce((s, l) => s + l.quote.total, 0);
    const originalTotal = lines.reduce(
      (s, l) => s + (l.quote.originalTotal ?? l.quote.total),
      0,
    );
    return { total, originalTotal, currency };
  }, [lines]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Adres ve Onay</p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          Seçtiğiniz hizmetler için adres ve iletişim bilgilerinizi girin. Tüm işlemler tek adreste
          planlanır.
        </p>
        {lines.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
            Bu adrese dahil etmek için en az bir hizmet seçin.
          </p>
        ) : (
          <ul className="mt-3 space-y-4 text-sm">
            {lines.map((line) => (
              <li
                key={line.id}
                className="border-b border-zinc-100 pb-3 last:border-0 last:pb-0 dark:border-zinc-800"
              >
                <p className="font-medium text-zinc-800 dark:text-zinc-100">{line.serviceName}</p>
                <ul className="mt-2 space-y-1 text-zinc-600 dark:text-zinc-300">
                  {line.quote.lines.map((l) => (
                    <li key={`${l.pricing_rule_id ?? "campaign"}:${l.label}`} className="flex justify-between gap-2">
                      <span>{l.title}</span>
                      <span className="shrink-0">
                        <PriceDisplay amount={l.line_total} currency={line.quote.currency} />
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex justify-between text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  <span>Ara toplam</span>
                  <PriceDisplay
                    amount={line.quote.total}
                    originalAmount={line.quote.originalTotal ?? null}
                    currency={line.quote.currency}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 text-base font-semibold dark:border-zinc-800">
          <span>Genel toplam</span>
          <PriceDisplay
            amount={grand.total}
            originalAmount={grand.originalTotal}
            currency={grand.currency}
          />
        </div>
      </div>

      {CHECKOUT_VERIFICATION_ENABLED && needsAuthVerification ? (
        <OrderVerificationGate />
      ) : (
        <>
          {!CHECKOUT_VERIFICATION_ENABLED ? (
            <aside className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300">
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                İletişim doğrulaması (MVP’de kapalı)
              </p>
              <p className="mt-2">
                Canlıda açıldığında burada da sipariş öncesi doğrulama gösterilecek.
              </p>
            </aside>
          ) : null}

          <form
            {...(formId ? { id: formId } : {})}
            action={submitCartCheckout}
            className="space-y-4"
          >
            <p className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
              Kayıtlı adreslerinizi hızlı seçmek veya yeni adres eklemek için{" "}
              <Link href="/profil" className="font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-300">
                Profilim
              </Link>{" "}
              sayfasını kullanabilirsiniz.
            </p>

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
            <SmartAddressField value={addressLine} onChange={setAddressLine} savedAddresses={savedAddresses} />
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

            <button
              type="submit"
              disabled={lines.length === 0}
              className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:pointer-events-none disabled:opacity-50"
            >
              Teslimatı onayla ve siparişleri oluştur
            </button>
          </form>
        </>
      )}
    </div>
  );
}
