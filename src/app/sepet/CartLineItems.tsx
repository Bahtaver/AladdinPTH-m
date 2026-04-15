"use client";

import type { ChangeEvent } from "react";
import Image from "next/image";
import { toggleFavoriteFromCartItemForm } from "@/app/actions/favoritesActions";
import { HeartFill24, HeartStroke24 } from "@/components/icons/Heart24";
import { removeCartItemFromForm } from "@/app/actions/cartActions";
import { PriceDisplay } from "@/components/commerce/PriceDisplay";

export type CartLineDisplay = {
  id: string;
  /** Favori durumu ve toggle için. */
  serviceId: string;
  serviceName: string;
  slug: string;
  imgUrl: string | null;
  total: number;
  currency: string;
};

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M9 3h6m-7 4h8l-1 14H8L7 7Zm3 4v8m4-8v8M10 7V4h4v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type CartLineSelection = {
  selectedIds: Set<string>;
  onChange: (id: string, checked: boolean) => void;
};

type Props = {
  lines: CartLineDisplay[];
  /** Bu hizmet kimlikleri favorilerde (dolu kalp). */
  favoritedServiceIds: string[];
  /**
   * Alttaki `submitCartCheckout` formunun `id` değeri — kutular bu forma bağlanır.
   * Doğrulama kapısı açıkken `null`: sipariş kutuları gösterilmez.
   */
  checkoutFormId: string | null;
  /** Verilmezse veya `checkoutFormId` yoksa kutular kontrolsüz (varsayılan işaretli) kalır. */
  selection?: CartLineSelection | null;
};

function LineMain({ line }: { line: CartLineDisplay }) {
  return (
    <>
      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-700">
        {line.imgUrl ? (
          <Image
            src={line.imgUrl}
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
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-zinc-900 dark:text-zinc-50">{line.serviceName}</span>
        {line.slug ? (
          <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{line.slug}</span>
        ) : null}
      </span>
    </>
  );
}

export function CartLineItems({ lines, favoritedServiceIds, checkoutFormId, selection }: Props) {
  const favorited = new Set(favoritedServiceIds);

  return (
    <ul className="space-y-3">
      {lines.map((line) => {
        const included = checkoutFormId
          ? (selection ? selection.selectedIds.has(line.id) : true)
          : false;
        return (
          <li
            key={line.id}
            className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            {checkoutFormId ? (
              <input
                id={`cart-include-${line.id}`}
                form={checkoutFormId}
                type="checkbox"
                name="cart_item_id"
                value={line.id}
                {...(selection
                  ? {
                      checked: selection.selectedIds.has(line.id),
                      onChange: (e: ChangeEvent<HTMLInputElement>) =>
                        selection.onChange(line.id, e.target.checked),
                    }
                  : { defaultChecked: true })}
                className="mt-1 size-4 shrink-0 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                aria-label={`${line.serviceName} — bu siparişe dahil et`}
              />
            ) : (
              <span className="mt-1 size-4 shrink-0" aria-hidden />
            )}
            {checkoutFormId ? (
              <label
                htmlFor={`cart-include-${line.id}`}
                className="flex min-w-0 flex-1 cursor-pointer items-start gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-start gap-3">
                    <LineMain line={line} />
                  </div>
                  <span
                    className={[
                      "mt-1 block text-xs font-medium",
                      included
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-zinc-500 dark:text-zinc-400",
                    ].join(" ")}
                  >
                    {included ? "✓ Bu adrese dahil et" : "Bu adrese dahil et"}
                  </span>
                </div>
              </label>
            ) : (
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <LineMain line={line} />
              </div>
            )}
            <div className="flex shrink-0 items-center gap-1.5 self-start pt-0.5 sm:gap-2">
              <PriceDisplay amount={line.total} currency={line.currency} />
              <form action={toggleFavoriteFromCartItemForm} className="shrink-0">
                <input type="hidden" name="cart_item_id" value={line.id} />
                <button
                  type="submit"
                  className={[
                    "flex size-10 items-center justify-center rounded-xl border transition-colors",
                    favorited.has(line.serviceId)
                      ? "border-rose-400 bg-rose-500 text-white hover:bg-rose-600 dark:border-rose-500 dark:bg-rose-600 dark:hover:bg-rose-500"
                      : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900/45 dark:bg-rose-950/35 dark:text-rose-300 dark:hover:bg-rose-950/55",
                  ].join(" ")}
                  aria-label={favorited.has(line.serviceId) ? "Favorilerden çıkar" : "Favorilere ekle"}
                >
                  {favorited.has(line.serviceId) ? (
                    <HeartFill24 className="size-5 shrink-0" />
                  ) : (
                    <HeartStroke24 className="size-5 shrink-0" />
                  )}
                </button>
              </form>
              <form action={removeCartItemFromForm} className="shrink-0">
                <input type="hidden" name="cart_item_id" value={line.id} />
                <button
                  type="submit"
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-2.5 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950/60"
                  aria-label="Kaldır"
                >
                  <TrashIcon />
                  Kaldır
                </button>
              </form>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
