import type { SupabaseClient } from "@supabase/supabase-js";
import type { CustomerFavoriteRow, ServiceRow } from "@/types/database";

export type FavoriteWithService = CustomerFavoriteRow & {
  services: Pick<ServiceRow, "slug" | "name" | "cover_image_path"> | null;
};

export async function loadFavoritesWithServices(
  supabase: SupabaseClient,
  customerId: string,
): Promise<FavoriteWithService[]> {
  const { data, error } = await supabase
    .from("customer_favorites")
    .select(
      "id, customer_id, service_id, selection_json, display_title, notify_on_discount, sort_order, created_at, updated_at, services(slug, name, cover_image_path)",
    )
    .eq("customer_id", customerId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as FavoriteWithService[];
}
