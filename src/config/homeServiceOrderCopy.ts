/** Sipariş sayfası başlığı + giriş (DB yerine). */
export type OrderPageMeta = {
  displayName: string;
  intro: string;
};

export type ConfigureHeaderCopy = {
  title: string;
  description: string;
};

export const ORDER_PAGE_META: Record<string, OrderPageMeta> = {
  "carpet-cleaning": {
    displayName: "Halı Temizlik & Bakım Hizmeti",
    intro:
      "Halılarınızı metrekare ve elyaf tipine göre kolayca planlayın. Profesyonel ekipman ve uygun yöntemlerle etkili temizlik sağlanır, fiyat anında hesaplanır.",
  },
  "sofa-cleaning": {
    displayName: "Koltuk Temizlik & Bakım Hizmeti",
    intro:
      "Koltuk tipinize göre sabit paketlerle kolayca seçim yapın. Yerinde profesyonel uygulama ile derinlemesine temizlik sağlanır, fiyat baştan nettir.",
  },
  "window-cleaning": {
    displayName: "Cam Temizlik & Bakım Hizmeti",
    intro:
      "Pencere ve balkon camlarınızı ayrı ayrı seçin, ihtiyacınıza göre planlayın. Profesyonel ekipmanlarla iz bırakmayan temizlik uygulanır, fiyat anında hesaplanır.",
  },
};

export const CONFIGURE_HEADER_COPY: Record<string, ConfigureHeaderCopy> = {
  "carpet-cleaning": {
    title: "Sana uygun olanı seç",
    description:
      "Halı alanını ve elyaf türünü gir. Uygun temizlik yöntemiyle etkili sonuç al, fiyatını anında gör.",
  },
  "sofa-cleaning": {
    title: "Sana uygun olanı seç",
    description:
      "Koltuk tipini seç, sabit paketini belirle. Derinlemesine temizlik ile yenilenmiş görünüm elde et.",
  },
  "window-cleaning": {
    title: "Sana uygun olanı seç",
    description:
      "Cam türünü ve adet bilgisini seç. İz bırakmayan profesyonel temizlikle net sonuç elde et.",
  },
};

export const PLANNING_CONTINUE_HINT = "Tamamlamanıza 1 adım kaldı";

const PLANNING_SLUGS = new Set(["carpet-cleaning", "sofa-cleaning", "window-cleaning"]);

export function usesPlanningContinue(slug: string): boolean {
  return PLANNING_SLUGS.has(slug);
}
