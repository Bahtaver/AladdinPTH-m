/**
 * Sipariş akışı görselleri — `service_option_assets` bucket kökü (dosya adı).
 * İleride diğer hizmetler için buraya veya ayrı modüllere benzer tablolar eklenebilir.
 */

export const carWashPackageMedia = [
  {
    value: "interior" as const,
    storagePath: "arac-ic-gorsel.png",
    label: "İç Detaylı Temizlik",
  },
  {
    value: "exterior" as const,
    storagePath: "dis-gorsel.png",
    label: "Dış Yıkama",
  },
  {
    value: "interior_exterior" as const,
    storagePath: "ic-dis.png",
    label: "İç + Dış Bakım",
  },
];

export const carWashVehicleMedia = [
  {
    value: "sedan" as const,
    storagePath: "binek.png",
    label: "Binek",
  },
  {
    value: "suv" as const,
    storagePath: "suv.png",
    label: "SUV",
  },
  {
    value: "pickup" as const,
    storagePath: "kamyonet.png",
    label: "Kamyonet / Pickup",
  },
];

/** Halı yıkama — `fiber` alanı (`service_option_assets`). */
export const carpetFiberMedia = [
  {
    value: "synthetic" as const,
    storagePath: "sentetik-dokum-hali.png",
    label: "Sentetik",
  },
  {
    value: "natural" as const,
    storagePath: "dogal-lifli-hali.png",
    label: "Doğal Elyaf",
  },
];

/** Koltuk yıkama — `sofa_type` alanı (`service_option_assets`). */
export const sofaTypeMedia = [
  {
    value: "single" as const,
    storagePath: "1-li-koltuk.png",
    label: "Tekli Koltuk",
  },
  {
    value: "double" as const,
    storagePath: "2-li-koltuk.png",
    label: "İkili Koltuk",
  },
  {
    value: "full_set" as const,
    storagePath: "koltuk-takim.png",
    label: "Tam Takım",
  },
  {
    value: "chair" as const,
    storagePath: "sandalye.png",
    label: "Sandalye",
  },
];
