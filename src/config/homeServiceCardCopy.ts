/**
 * Ana sayfa hizmet kartı metinleri — DB `name` / `short_description` yerine sabit kopya.
 */
export type HomeServiceCardCopy = {
  title: string;
  description: string;
  ctaLabel: string;
};

export const HOME_SERVICE_CARD_COPY: Record<string, HomeServiceCardCopy> = {
  "car-wash": {
    title: "Araç Yıkama & Detaylı Bakım",
    description:
      "Hizmetinizi adım adım seçin, ek işlemleri ekleyin ve adresinizde profesyonel uygulama ile tamamlayın. Süreç baştan sona şeffaf ve kontrol sizde.",
    ctaLabel: "Hizmeti Planla",
  },
  "sofa-cleaning": {
    title: "Koltuk Temizlik & Bakım Hizmeti",
    description:
      "Koltuk tipinize göre sabit paketlerle kolayca seçim yapın. Yerinde profesyonel uygulama ile derinlemesine temizlik sağlanır, fiyat baştan nettir.",
    ctaLabel: "Hizmeti Planla",
  },
  "carpet-cleaning": {
    title: "Halı Temizlik & Bakım Hizmeti",
    description:
      "Halılarınızı metrekare ve elyaf tipine göre kolayca planlayın. Profesyonel ekipman ve uygun yöntemlerle etkili temizlik sağlanır, fiyat anında hesaplanır.",
    ctaLabel: "Hizmeti Planla",
  },
  "window-cleaning": {
    title: "Cam Temizlik & Bakım Hizmeti",
    description:
      "Pencere ve balkon camlarınızı ayrı ayrı seçin, ihtiyacınıza göre planlayın. Profesyonel ekipmanlarla iz bırakmayan temizlik uygulanır, fiyat anında hesaplanır.",
    ctaLabel: "Hizmeti Planla",
  },
};

export function getHomeServiceCardCopy(slug: string | null | undefined): HomeServiceCardCopy | null {
  if (!slug) return null;
  return HOME_SERVICE_CARD_COPY[slug] ?? null;
}
