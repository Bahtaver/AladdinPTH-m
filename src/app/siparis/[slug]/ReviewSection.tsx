import { addOrderDraftToCart } from "@/app/actions/cartActions";
import { submitOrder } from "@/app/actions/orderFlow";
import { OrderVerificationGate } from "@/components/auth/OrderVerificationGate";
import { CHECKOUT_VERIFICATION_ENABLED } from "@/lib/auth/checkoutVerification";
import type { OrderDraft } from "@/lib/order/draftSchema";
import { PriceDisplay } from "@/components/commerce/PriceDisplay";
import type { PriceQuote } from "@/lib/pricing/engine";
import { CartBag24 } from "@/components/icons/CartBag24";
import { DraftFavoriteButton } from "./DraftFavoriteButton";

type Props = {
  slug: string;
  draft: OrderDraft;
  quote: PriceQuote;
  needsAuthVerification: boolean;
  showFavorite: boolean;
  isFavorited: boolean;
  canFavorite: boolean;
};

export function ReviewSection({
  slug,
  draft,
  quote,
  needsAuthVerification,
  showFavorite,
  isFavorited,
  canFavorite,
}: Props) {
  const f = draft.fulfillment;
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Hizmet özeti
        </p>
        <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-200">
          {quote.lines.map((l) => (
            <li key={l.pricing_rule_id} className="flex justify-between gap-3">
              <span>{l.title}</span>
              <span className="shrink-0 font-medium">
                <PriceDisplay amount={l.line_total} currency={quote.currency} />
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 text-base font-semibold dark:border-zinc-800">
          <span>Toplam</span>
          <PriceDisplay amount={quote.total} currency={quote.currency} />
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-100">
        <p className="font-semibold">Teslimat</p>
        <p className="mt-2">{f.full_name}</p>
        <p>{f.phone}</p>
        <p className="mt-2 whitespace-pre-wrap">{f.address_line}</p>
        {f.time_window_preference ? (
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
            Tercih: {f.time_window_preference}
          </p>
        ) : null}
        {f.customer_note ? (
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
            Not: {f.customer_note}
          </p>
        ) : null}
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
                Canlı sürümde sipariş öncesi e-posta ile doğrulama
                açılacak; altyapı hazır —{" "}
                <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-[11px] dark:bg-zinc-800">
                  CHECKOUT_VERIFICATION_ENABLED
                </code>{" "}
                değerini{" "}
                <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-[11px] dark:bg-zinc-800">
                  true
                </code>{" "}
                yapmanız yeterli.
              </p>
            </aside>
          ) : null}
          <div className="flex gap-2">
            {showFavorite ? (
              <DraftFavoriteButton
                slug={slug}
                isFavorited={isFavorited}
                disabled={!canFavorite}
              />
            ) : null}
            <form action={addOrderDraftToCart} className="min-w-0 flex-1">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="draft_source" value="review" />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm hover:border-emerald-300 hover:bg-emerald-50/80 dark:border-emerald-800 dark:bg-zinc-950 dark:text-emerald-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
              >
                <CartBag24 className="size-5 shrink-0" />
                Sepete ekle
              </button>
            </form>
          </div>
          <form action={submitOrder} className="mt-3">
            <input type="hidden" name="slug" value={slug} />
            <button
              type="submit"
              className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
            >
              Siparişi onayla
            </button>
          </form>
        </>
      )}
    </div>
  );
}
