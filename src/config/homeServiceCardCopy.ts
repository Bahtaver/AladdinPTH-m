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
      "Kumaş tipinize uygun paketi rehberde seçin; fiyatı anında görün, ek hizmetleri dilediğiniz gibi ekleyin. Ekibimiz adresinizde profesyonel ekipmanla uygular — süreç şeffaf, kontrol sizde, hijyen uzun soluklu.",
    ctaLabel: "Hizmeti Planla",
  },
  "carpet-cleaning": {
    title: "Halı Temizlik & Bakım Hizmeti",
    description:
      "Halı tipinizi ve ihtiyacınızı adım adım belirtin; leke yoğunluğuna uygun yöntem ve paket netleşir, tutar önceden hesaplanır. Yerinde veya uygun koşullarda uygulama ile etkili temizlik ve güven veren iletişim.",
    ctaLabel: "Hizmeti Planla",
  },
  "window-cleaning": {
    title: "Cam Temizlik & Bakım Hizmeti",
    description:
      "İç ve dış yüzeyleri rehberde işaretleyin; erişim zorluğu dahil güvenli plan yapılır, ürünler profesyonel standartta kullanılır. Fiyat şeffaf, ekip ziyaret öncesi bilgilendirir, sonuç detaylı şekilde tamamlanır.",
    ctaLabel: "Hizmeti Planla",
  },
};

export function getHomeServiceCardCopy(slug: string | null | undefined): HomeServiceCardCopy | null {
  if (!slug) return null;
  return HOME_SERVICE_CARD_COPY[slug] ?? null;
}
