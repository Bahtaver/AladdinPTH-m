import type { OrderConfiguration } from "@/lib/pricing/engine";

export function configurationError(
  serviceSlug: string,
  configuration: OrderConfiguration,
): string | null {
  switch (serviceSlug) {
    case "car-wash": {
      if (!configuration.cleaning_type) return "Paket seçin (iç / dış / ikisi).";
      if (!configuration.vehicle_class) return "Araç sınıfını seçin.";
      if (configuration.touch_up_requested === true) {
        const code = String(configuration.color_code ?? "").trim();
        if (code.length < 3) return "Rötuş için araç renk kodunu girin.";
        if (configuration.disclaimer_accepted !== true)
          return "Rötuş hizmeti feragatnamesini onaylayın.";
      }
      return null;
    }
    case "carpet-cleaning": {
      if (!configuration.fiber) return "Halı fiber tipini seçin.";
      const sqm = Number(configuration.sqm);
      if (!Number.isFinite(sqm) || sqm <= 0) return "Geçerli bir metrekare girin.";
      return null;
    }
    case "sofa-cleaning": {
      if (!configuration.sofa_type) return "Koltuk tipini seçin.";
      return null;
    }
    case "window-cleaning": {
      const windows = Number(configuration.window_count ?? 0);
      const balcony = configuration.balcony_glass === true;
      if (!Number.isFinite(windows) || windows < 0)
        return "Pencere adedi geçersiz.";
      if (!balcony && windows <= 0)
        return "En az bir pencere ekleyin veya balkon camını işaretleyin.";
      return null;
    }
    default:
      return "Bilinmeyen hizmet.";
  }
}
