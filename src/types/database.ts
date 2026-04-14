export type ServiceRow = {
  id: string;
  name: string;
  base_price: string | number | null;
  slug: string | null;
  short_description: string | null;
  long_description: string | null;
  cover_image_path: string | null;
  is_active: boolean | null;
  sort_order: number | null;
};

export type PricingRuleRow = {
  id: string;
  service_id: string;
  priority: number;
  match_criteria: Record<string, unknown>;
  pricing_model: "fixed" | "per_unit" | "composite";
  currency: string;
  base_amount: string | number;
  unit_amount: string | number | null;
  unit_key: string | null;
  label: string;
  stackable: boolean;
};

export type ServiceConfigurationRow = {
  id: string;
  service_id: string;
  flow_slug: string;
  definition: Record<string, unknown>;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  contact_email: string | null;
};

export type ProfilePhoneBookRow = {
  id: string;
  user_id?: string;
  label: string;
  phone: string;
  created_at: string;
};

/** `customer_addresses` — profil / ileride siparişte kullanım (şu an sipariş taslağından bağımsız). */
export type CustomerAddressRow = {
  id: string;
  customer_id?: string;
  label: string | null;
  address_line: string;
  created_at: string;
};

export type CartRow = {
  id: string;
  customer_id: string;
  created_at: string;
  updated_at: string;
};

export type CartItemRow = {
  id: string;
  cart_id: string;
  service_id: string;
  configuration: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** `customer_favorites` — `selection_json` ≈ `CartItemRow.configuration` (kayıtlı / favori seçimler). */
export type CustomerFavoriteRow = {
  id: string;
  customer_id: string;
  service_id: string;
  selection_json: Record<string, unknown>;
  display_title: string | null;
  notify_on_discount: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
