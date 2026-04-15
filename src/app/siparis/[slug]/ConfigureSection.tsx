import { updateDraftField, saveTouchUpDetails } from "@/app/actions/orderFlow";
import { CarpetSqmField } from "@/components/commerce/CarpetSqmField";
import { VisualChoiceCard } from "@/components/commerce/VisualChoiceCard";
import { PriceDisplay } from "@/components/commerce/PriceDisplay";
import { WindowCountStepper } from "@/components/commerce/WindowCountStepper";
import { CAR_WASH_CONFIGURE_HEADER } from "@/config/carWashFlowCopy";
import { CONFIGURE_HEADER_COPY } from "@/config/homeServiceOrderCopy";
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
  showReadyNote?: boolean;
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

function ConfigurePriceFooter({
  quote,
  variant,
}: {
  quote: PriceQuote;
  variant: "dynamic" | "sofa-fixed";
}) {
  const sub =
    variant === "sofa-fixed"
      ? "Sabit paket fiyatları uygulanır. Ek ücret sürprizi yoktur."
      : "Seçimlerinize göre fiyat otomatik hesaplanır. Gizli ücret yoktur.";
  return (
    <footer className="space-y-2 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <div>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Anlık Toplam</p>
        <div className="mt-1">
          <PriceDisplay amount={quote.total} currency={quote.currency} />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{sub}</p>
      </div>
    </footer>
  );
}

function FlowIntroHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="space-y-2 border-b border-zinc-100 pb-6 dark:border-zinc-800">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{description}</p>
    </header>
  );
}

function ReadyNote() {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm dark:border-emerald-800/80 dark:bg-emerald-950/35">
      <p className="font-semibold text-emerald-900 dark:text-emerald-100">✔ Seçimleriniz hazır</p>
      <p className="mt-1 text-emerald-800/90 dark:text-emerald-200">Tamamlamanıza 1 adım kaldı</p>
    </div>
  );
}

export function ConfigureSection({ slug, draft, quote, showReadyNote = false }: Props) {
  const c = draft.configuration;

  if (slug === "car-wash") {
    const cleaning = String(c.cleaning_type ?? "");
    const vehicle = String(c.vehicle_class ?? "");
    const touchUp = c.touch_up_requested === true;
    return (
      <div className="space-y-8">
        <header className="space-y-2 border-b border-zinc-100 pb-6 dark:border-zinc-800">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {CAR_WASH_CONFIGURE_HEADER.title}
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {CAR_WASH_CONFIGURE_HEADER.description}
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

        {showReadyNote ? <ReadyNote /> : null}
        <ConfigurePriceFooter quote={quote} variant="dynamic" />
      </div>
    );
  }

  if (slug === "carpet-cleaning") {
    const fiber = String(c.fiber ?? "");
    const sqmDefault = c.sqm != null && Number.isFinite(Number(c.sqm)) ? String(c.sqm) : "";
    const copy = CONFIGURE_HEADER_COPY["carpet-cleaning"];
    return (
      <div className="space-y-8">
        <FlowIntroHeader title={copy.title} description={copy.description} />

        <section className="space-y-3">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">1. Halı Bilgisi</p>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Metrekare (m²)
            </p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
              Halının toplam alanını girin
            </p>
            <div className="mt-2">
              <CarpetSqmField slug={slug} defaultValue={sqmDefault} />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">2. Elyaf Türü</p>
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
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Elyaf türüne göre uygun temizlik yöntemi uygulanır.
          </p>
        </section>

        {showReadyNote ? <ReadyNote /> : null}
        <ConfigurePriceFooter quote={quote} variant="dynamic" />
      </div>
    );
  }

  if (slug === "sofa-cleaning") {
    const sofaType = String(c.sofa_type ?? "");
    const copy = CONFIGURE_HEADER_COPY["sofa-cleaning"];
    return (
      <div className="space-y-8">
        <FlowIntroHeader title={copy.title} description={copy.description} />

        <section className="space-y-3">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">1. Koltuk Düzeni</p>
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
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Seçiminize göre sabit paket fiyatı uygulanır.
          </p>
        </section>

        {showReadyNote ? <ReadyNote /> : null}
        <ConfigurePriceFooter quote={quote} variant="sofa-fixed" />
      </div>
    );
  }

  if (slug === "window-cleaning") {
    const balcony = c.balcony_glass === true;
    const windowCount = Number(c.window_count ?? 0);
    const copy = CONFIGURE_HEADER_COPY["window-cleaning"];
    return (
      <div className="space-y-8">
        <FlowIntroHeader title={copy.title} description={copy.description} />

        <section className="space-y-3">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            1. Standart Pencereler
          </p>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Adet seçimi
          </p>
          <div className="mt-2">
            <WindowCountStepper slug={slug} count={windowCount} />
          </div>
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Her pencere için ayrı hesaplama yapılır.
          </p>
        </section>

        <section className="space-y-3">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">2. Balkon Cam Sistemi</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Choice slug={slug} field="balcony_glass" value="true" selected={balcony === true}>
              Dahil Et
            </Choice>
            <Choice
              slug={slug}
              field="balcony_glass"
              value="false"
              selected={c.balcony_glass === false}
            >
              Dahil Etme
            </Choice>
          </div>
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Balkon cam sistemleri sabit paket olarak eklenir.
          </p>
        </section>

        {showReadyNote ? <ReadyNote /> : null}
        <ConfigurePriceFooter quote={quote} variant="dynamic" />
      </div>
    );
  }

  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-300">
      Bu hizmet için akış henüz tanımlanmadı.
    </p>
  );
}
