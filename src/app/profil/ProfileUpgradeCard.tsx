"use client";

import { OrderVerificationGate } from "@/components/auth/OrderVerificationGate";
import {
  CHECKOUT_VERIFICATION_ENABLED,
} from "@/lib/auth/checkoutVerification";

type Props = {
  isAnonymous: boolean;
};

/**
 * Misafir → tam hesap; sipariş özetindeki OTP kapısından ayrı bir bağlamda gösterilir.
 */
export function ProfileUpgradeCard({ isAnonymous }: Props) {
  if (!isAnonymous) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3.5 text-sm text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-50 sm:px-5 sm:py-4">
        <p className="font-semibold">Tam hesap</p>
        <p className="mt-1.5 text-sm leading-relaxed text-emerald-900/90 dark:text-emerald-100/90">
          Oturumunuz doğrulanmış veya anonim değil. Profil bilgilerinizi aşağıdan
          güncelleyebilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-900/40 sm:px-5 sm:py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-950 dark:bg-amber-950/60 dark:text-amber-100">
          Misafir oturumu
        </span>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
          Hesabımı yükselt
        </p>
      </div>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        Buradaki kayıtlar <strong>sipariş sırasında</strong> girdiğiniz adres ve
        telefonla aynı olmak zorunda değildir; örneğin teslimatta aranacak ek
        numaraları ekleyebilirsiniz.{" "}
        <strong>Sipariş öncesi e-posta doğrulaması (açıksa) ayrı bir adımdır</strong>{" "}
        ve bu sayfadaki rehberle karışmaz.
      </p>
      {CHECKOUT_VERIFICATION_ENABLED ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-3.5 dark:border-zinc-700 dark:bg-zinc-950 sm:p-4">
          <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            E-postanı doğrula
          </p>
          <OrderVerificationGate />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white/80 px-4 py-3 text-sm leading-relaxed text-zinc-600 dark:border-zinc-600 dark:bg-zinc-950/60 dark:text-zinc-300">
          Canlıda sipariş öncesi doğrulama açıldığında burada aynı adımlar
          kullanılacak. Şu an doğrulama kapalı — yine de aşağıdan iletişim
          tercihlerinizi kaydedebilirsiniz.
        </p>
      )}
    </div>
  );
}
