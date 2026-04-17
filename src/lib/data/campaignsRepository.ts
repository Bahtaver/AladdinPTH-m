import type { SupabaseClient } from "@supabase/supabase-js";
import type { CampaignRow } from "@/types/database";

export async function listActiveCampaignsForService(
  supabase: SupabaseClient,
  serviceId: string,
): Promise<CampaignRow[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select(
      "id,name,description,discount_type,discount_value,max_discount,min_order_total,stackable,priority,starts_at,ends_at,is_active,status,audience_type,campaign_services!inner(service_id)",
    )
    .eq("is_active", true)
    .eq("status", "active")
    .eq("campaign_services.service_id", serviceId)
    .order("priority", { ascending: false });

  if (error) {
    return [];
  }

  const nowMs = Date.now();
  return ((data ?? []) as CampaignRow[]).filter((campaign) => {
    const startsAtMs = campaign.starts_at ? new Date(campaign.starts_at).getTime() : null;
    const endsAtMs = campaign.ends_at ? new Date(campaign.ends_at).getTime() : null;
    const started = startsAtMs === null || startsAtMs <= nowMs;
    const notEnded = endsAtMs === null || endsAtMs >= nowMs;
    return started && notEnded;
  });
}

