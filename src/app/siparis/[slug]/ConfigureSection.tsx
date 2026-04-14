import { updateDraftField, saveTouchUpDetails } from "@/app/actions/orderFlow";
import { VisualChoiceCard } from "@/components/commerce/VisualChoiceCard";
import { PriceDisplay } from "@/components/commerce/PriceDisplay";
import {
  CAR_WASH_CONFIGURE_HEADING,
  CAR_WASH_CONFIGURE_SUB,
} from "@/config/carWashFlowCopy";
import {
  carWashPackageMedia,
  carWashVehicleMedia,
  carpetFiberMedia,
  sofaTypeMedia,
} from "@/config/serviceFlowMedia";
import type { OrderDraft } from "@/lib/order/draftSchema";
import { publicServiceAssetUrl } from "@/lib/storage/serviceAssetUrl";
import type { PriceQuote } from "@/lib/pricing/engine";

type Props = {
  slug: string;
  draft: OrderDraft;
  quote: PriceQuote;
};

function Choice({
  slug,
  field,
  value,
  selected,
  children,
}: {
  slug: string;
  field: string;
  value: string;
  selected: boolean;
  children: React.ReactNode;
}) {
  return (
    <form action={updateDraftField}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={value} />
      <button
        type="submit"
        className={[
          "w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
          selected
            ? "border-emerald-600 bg-emerald-50 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-50"
            : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-700",
        ].join(" ")}
      >
        {children}
      </button>
    </form>
  );
}

export function ConfigureSection({ slug, draft, quote }: Props) {
  const c = draft.configuration;

  if (slug === "car-wash") {
    const cleaning = String(c.cleaning_type ?? "");
    const vehicle = String(c.vehicle_class ?? "");
    const touchUp = c.touch_up_requested === true;
    return (
      <div className="space-y-8">
        <header className="space-y-2 border-b border-zinc-100 pb-6 dark:border-zinc-800">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {CAR_WASH_CONFIGURE_HEADING}
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {CAR_WASH_CONFIGURE_SUB}
          </p>
        </header>

        <section className="space-y-3">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            1. Hizmet Paketi
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {carWashPackageMedia.map((item) => (
              <VisualChoiceCard
                key={item.value}
                slug={slug}
                field="cleaning_type"
                value={item.value}
                label={item.label}
                imageUrl={publicServiceAssetUrl(item.storagePath)}
                selected={cleaning === item.value}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            2. Araç Tipi
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {carWashVehicleMedia.map((item) => (
              <VisualChoiceCard
                key={item.value}
                slug={slug}
                field="vehicle_class"
                value={item.value}
                label={item.label}
                imageUrl={publicServiceAssetUrl(item.storagePath)}
                selected={vehicle === item.value}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            3. Ek Hizmet (İsteğe Bağlı)
          </p>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Rötuş Boya</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              Küçük yüzey çizikleri için aynı ziyarette uygulanabilir. Renk uyumu araç koduna göre
              yapılır.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Choice
              slug={slug}
              field="touch_up_requested"
              value="false"
              selected={!touchUp}
            >
              Dahil etme
            </Choice>
            <Choice
              slug={slug}
              field="touch_up_requested"
              value="true"
              selected={touchUp}
            >
              Ekle
            </Choice>
          </div>
        </section>

        {touchUp ? (
          <section className="space-y-3">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
              4. Renk kodu ve onay
            </p>
            <form action={saveTouchUpDetails} className="space-y-4">
              <input type="hidden" name="slug" value={slug} />
              <input
                name="color_code"
                defaultValue={String(c.color_code ?? "")}
                placeholder="Örn. 040 / Z2S / WA-8555"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 outline-none ring-emerald-500/40 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                required
                minLength={3}
              />
              <label className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-200">
                <input
                  type="checkbox"
                  name="disclaimer_accepted"
                  defaultChecked={c.disclaimer_accepted === true}
                  className="mt-1 size-4 rounded border-zinc-300 text-emerald-600"
                />
                <span>
                  Rötuşun yalnızca küçük yüzey çizikleri için olduğunu; rengin aracınızın
                  fabrika koduna göre uyarlandığını ve sonucun yüzey durumuna bağlı
                  değişebileceğini kabul ediyorum.
                </span>
              </label>
              <button
                type="submit"
                className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Rötuş bilgisini kaydet
              </button>
            </form>
          </section>
        ) : null}

        <footer className="space-y-2 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Anlık Toplam</p>
            <div className="mt-1">
              <PriceDisplay amount={quote.total} currency={quote.currency} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Seçimlerinize göre fiyat otomatik hesaplanır. Gizli ücret yoktur.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  if (slug === "carpet-cleaning") {
    const fiber = String(c.fiber ?? "");
    return (
      <div className="space-y-8">
        <section className="space-y-3">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            1. Elyaf tipi
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {carpetFiberMedia.map((item) => (
              <VisualChoiceCard
                key={item.value}
                slug={slug}
                field="fiber"
                value={item.value}
                label={item.label}
                imageUrl={publicServiceAssetUrl(item.storagePath)}
                selected={fiber === item.value}
              />
            ))}
          </div>
        </section>

        {fiber ? (
          <section className="space-y-3">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
              2. Tahmini alan (m²)
            </p>
            <form
              action={updateDraftField}
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="field" value="sqm" />
              <label className="flex-1 text-sm text-zinc-600 dark:text-zinc-300">
                Metrekare
                <input
                  name="value"
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step={0.5}
                  defaultValue={String(c.sqm ?? "")}
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 outline-none ring-emerald-500/40 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                  required
                />
              </label>
              <button
                type="submit"
                className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Güncelle
              </button>
            </form>
          </section>
        ) : null}

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            Canlı tutar
            <div className="mt-1">
              <PriceDisplay amount={quote.total} currency={quote.currency} />
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (slug === "sofa-cleaning") {
    const sofaType = String(c.sofa_type ?? "");
    return (
      <div className="space-y-6">
        <section className="space-y-3">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            Koltuk düzeni
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {sofaTypeMedia.map((item) => (
              <VisualChoiceCard
                key={item.value}
                slug={slug}
                field="sofa_type"
                value={item.value}
                label={item.label}
                imageUrl={publicServiceAssetUrl(item.storagePath)}
                selected={sofaType === item.value}
              />
            ))}
          </div>
        </section>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            Canlı tutar
            <div className="mt-1">
              <PriceDisplay amount={quote.total} currency={quote.currency} />
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (slug === "window-cleaning") {
    const balcony = c.balcony_glass === true;
    return (
      <div className="space-y-8">
        <section className="space-y-3">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            Standart pencereler
          </p>
          <form
            action={updateDraftField}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="field" value="window_count" />
            <label className="flex-1 text-sm text-zinc-600 dark:text-zinc-300">
              Adet
              <input
                name="value"
                type="number"
                inputMode="numeric"
                min={0}
                defaultValue={String(c.window_count ?? 0)}
                className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 outline-none ring-emerald-500/40 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              />
            </label>
            <button
              type="submit"
              className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Güncelle
            </button>
          </form>
        </section>

        <section className="space-y-3">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            Balkon cam sistemi
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Choice
              slug={slug}
              field="balcony_glass"
              value="true"
              selected={balcony === true}
            >
              Var — sabit paket eklenir
            </Choice>
            <Choice
              slug={slug}
              field="balcony_glass"
              value="false"
              selected={c.balcony_glass === false}
            >
              Yok
            </Choice>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            Canlı tutar
            <div className="mt-1">
              <PriceDisplay amount={quote.total} currency={quote.currency} />
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-300">
      Bu hizmet için akış henüz tanımlanmadı.
    </p>
  );
}
