import type { SupabaseClient } from "@supabase/supabase-js";
import type { ServiceConfigurationRow, ServiceRow } from "@/types/database";

export async function listActiveServices(
  supabase: SupabaseClient,
): Promise<ServiceRow[]> {
  const { data, error } = await supabase
    .from("services")
    .select(
      "id,name,base_price,slug,short_description,long_description,cover_image_path,is_active,sort_order",
    )
    .eq("is_active", true)
    .not("slug", "is", null)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`services: ${error.message}`);
  return (data ?? []) as ServiceRow[];
}

export async function getServiceById(
  supabase: SupabaseClient,
  id: string,
): Promise<ServiceRow | null> {
  const { data, error } = await supabase
    .from("services")
    .select(
      "id,name,base_price,slug,short_description,long_description,cover_image_path,is_active,sort_order",
    )
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`service by id: ${error.message}`);
  return (data as ServiceRow | null) ?? null;
}

export async function getServiceBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<ServiceRow | null> {
  const { data, error } = await supabase
    .from("services")
    .select(
      "id,name,base_price,slug,short_description,long_description,cover_image_path,is_active,sort_order",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`service by slug: ${error.message}`);
  return (data as ServiceRow | null) ?? null;
}

export async function getDefaultServiceConfiguration(
  supabase: SupabaseClient,
  serviceId: string,
): Promise<ServiceConfigurationRow | null> {
  const { data, error } = await supabase
    .from("service_configurations")
    .select("id,service_id,flow_slug,definition")
    .eq("service_id", serviceId)
    .eq("flow_slug", "default")
    .maybeSingle();

  if (error) throw new Error(`service_configurations: ${error.message}`);
  return (data as ServiceConfigurationRow | null) ?? null;
}
