"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function trimField(s: unknown, max: number): string {
  const t = String(s ?? "").trim();
  return t.length > max ? t.slice(0, max) : t;
}

export async function saveProfileBasics(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const full_name = trimField(formData.get("full_name"), 200) || null;
  const phone = trimField(formData.get("phone"), 40) || null;
  const contact_email = trimField(formData.get("contact_email"), 200) || null;
  const now = new Date().toISOString();

  const { data: existing, error: selErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (selErr) throw new Error(selErr.message);

  if (existing?.id) {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name,
        phone,
        contact_email,
        updated_at: now,
      })
      .eq("id", user.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      full_name,
      phone,
      contact_email,
      updated_at: now,
    });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/profil");
}

export async function addProfilePhoneEntry(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const label = trimField(formData.get("label"), 80);
  const phone = trimField(formData.get("phone"), 40);
  if (label.length < 1 || phone.length < 5) return;

  const { count, error: countError } = await supabase
    .from("profile_phone_book")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) >= 15) return;

  const { error } = await supabase.from("profile_phone_book").insert({
    user_id: user.id,
    label,
    phone,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/profil");
}

export async function deleteProfilePhoneEntry(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = trimField(formData.get("id"), 80);
  if (!id) return;

  const { error } = await supabase
    .from("profile_phone_book")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/profil");
}

const MAX_SAVED_ADDRESSES = 12;

export async function addProfileSavedAddress(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const labelRaw = trimField(formData.get("label"), 80);
  const address_line = trimField(formData.get("address_line"), 2000);
  if (address_line.length < 5) return;

  const { count, error: countError } = await supabase
    .from("customer_addresses")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", user.id);
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) >= MAX_SAVED_ADDRESSES) return;

  const { error } = await supabase.from("customer_addresses").insert({
    customer_id: user.id,
    label: labelRaw.length > 0 ? labelRaw : null,
    address_line,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/profil");
}

export async function deleteProfileSavedAddress(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = trimField(formData.get("id"), 80);
  if (!id) return;

  const { error } = await supabase
    .from("customer_addresses")
    .delete()
    .eq("id", id)
    .eq("customer_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/profil");
}
