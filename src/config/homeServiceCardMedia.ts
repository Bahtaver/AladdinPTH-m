/**
 * Ana sayfa “Siparişe başla” kartları — `service_option_assets` kökündeki dış kart görselleri.
 * DB `cover_image_path` yoksa veya güncellenmemişse burası önceliklidir.
 */
export const HOME_SERVICE_CARD_COVER: Record<string, string> = {
  "car-wash": "oto-wash-out-card.png",
  "sofa-cleaning": "koltuk-out-card.png",
  "carpet-cleaning": "hali-out-card.png",
  "window-cleaning": "cam-out.png",
};

export function getServiceCardCoverPath(
  slug: string | null | undefined,
  dbCoverPath: string | null | undefined,
): string | null {
  if (slug && HOME_SERVICE_CARD_COVER[slug]) {
    return HOME_SERVICE_CARD_COVER[slug];
  }
  return dbCoverPath ?? null;
}
