import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartItemRow, CartRow, ServiceRow } from "@/types/database";

export type CartItemWithService = CartItemRow & {
  services: Pick<ServiceRow, "slug" | "name" | "cover_image_path"> | null;
};

export async function ensureCustomerCartId(
  supabase: SupabaseClient,
  customerId: string,
): Promise<string> {
  const { data: existing, error: selErr } = await supabase
    .from("carts")
    .select("id")
    .eq("customer_id", customerId)
    .maybeSingle();
  if (selErr) throw new Error(selErr.message);
  if (existing?.id) return existing.id as string;

  const { data: created, error } = await supabase
    .from("carts")
    .insert({ customer_id: customerId })
    .select("id")
    .single();
  if (error || !created?.id) {
    throw new Error(error?.message ?? "Sepet oluşturulamadı.");
  }
  return created.id as string;
}

export async function loadCartWithItems(
  supabase: SupabaseClient,
  customerId: string,
): Promise<{ cart: CartRow; items: CartItemWithService[] } | null> {
  const { data: cart, error } = await supabase
    .from("carts")
    .select("id, customer_id, created_at, updated_at")
    .eq("customer_id", customerId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!cart?.id) return null;

  const { data: rows, error: itemErr } = await supabase
    .from("cart_items")
    .select(
      "id, cart_id, service_id, configuration, sort_order, created_at, updated_at, services(slug, name, cover_image_path)",
    )
    .eq("cart_id", cart.id)
    .order("sort_order", { ascending: true });

  if (itemErr) throw new Error(itemErr.message);

  return {
    cart: cart as CartRow,
    items: (rows ?? []) as unknown as CartItemWithService[],
  };
}
