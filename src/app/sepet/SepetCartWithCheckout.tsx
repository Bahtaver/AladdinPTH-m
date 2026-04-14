"use client";

import { useMemo, useState } from "react";
import { CartCheckoutForm, type CartCheckoutLine } from "@/app/sepet/CartCheckoutForm";
import { CartLineItems, type CartLineDisplay } from "@/app/sepet/CartLineItems";
import { SepetCheckoutGate } from "@/app/sepet/SepetCheckoutGate";
import { CHECKOUT_VERIFICATION_ENABLED } from "@/lib/auth/checkoutVerification";
import type { CustomerAddressRow } from "@/types/database";

type Props = {
  checkoutFormId: string | null;
  displayLines: CartLineDisplay[];
  favoritedServiceIds: string[];
  pricedLines: CartCheckoutLine[];
  savedAddresses: CustomerAddressRow[];
  profileDefaults: { full_name: string; phone: string };
  needsAuthVerification: boolean;
  defaultGateOpen: boolean;
};

/** `key={lineIdsKey}` ile yeniden mount: sepet satırları değişince seçim sıfırlanır (effect’siz). */
function SepetCartWithCheckoutInner({
  checkoutFormId,
  displayLines,
  favoritedServiceIds,
  pricedLines,
  savedAddresses,
  profileDefaults,
  needsAuthVerification,
  defaultGateOpen,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(pricedLines.map((l) => l.id)),
  );

  const filteredLines = useMemo(() => {
    const allow = checkoutFormId
      ? selectedIds
      : new Set(pricedLines.map((l) => l.id));
    return pricedLines.filter((l) => allow.has(l.id));
  }, [pricedLines, checkoutFormId, selectedIds]);

  const selection =
    checkoutFormId != null
      ? {
          selectedIds,
          onChange: (id: string, checked: boolean) => {
            setSelectedIds((prev) => {
              const next = new Set(prev);
              if (checked) next.add(id);
              else next.delete(id);
              return next;
            });
          },
        }
      : undefined;

  return (
    <div className="space-y-2">
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
          Kalemler
        </h2>
        <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          <strong>Sol kutu</strong> bu siparişe dahil etmek içindir (varsayılan hepsi işaretli);
          dahil etmek istemediklerinizin işaretini kaldırın — sepette kalırlar, sonra
          verebilirsiniz. <strong>Çöp kutusu</strong> kalemi sepetten tamamen siler.
        </p>
        {CHECKOUT_VERIFICATION_ENABLED && needsAuthVerification ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
            Sipariş seçimi için önce aşağıdaki iletişim doğrulamasını tamamlayın.
          </p>
        ) : null}
        <CartLineItems
          checkoutFormId={checkoutFormId}
          favoritedServiceIds={favoritedServiceIds}
          lines={displayLines}
          selection={selection}
        />
      </section>

      <section>
        <SepetCheckoutGate defaultOpen={defaultGateOpen}>
          <CartCheckoutForm
            {...(checkoutFormId ? { formId: checkoutFormId } : {})}
            lines={filteredLines}
            savedAddresses={savedAddresses}
            profileDefaults={profileDefaults}
            needsAuthVerification={needsAuthVerification}
          />
        </SepetCheckoutGate>
      </section>
    </div>
  );
}

export function SepetCartWithCheckout(props: Props) {
  const lineIdsKey = useMemo(
    () => props.pricedLines.map((l) => l.id).join(","),
    [props.pricedLines],
  );
  return <SepetCartWithCheckoutInner key={lineIdsKey} {...props} />;
}
