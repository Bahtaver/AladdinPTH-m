-- Kayıtlı iletişim numaraları + profilde opsiyonel iletişim e-postası (OTP / sipariş akışından ayrı).
-- Uzak: MCP apply_migration — yerel kopya.

alter table public.profiles add column if not exists contact_email text;

comment on column public.profiles.contact_email is 'Operasyon için opsiyonel iletişim e-postası; sipariş öncesi OTP / doğrulanmış hesap ile karıştırılmamalıdır.';

create table public.profile_phone_book (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  constraint profile_phone_book_label_len check (char_length(trim(label)) between 1 and 80),
  constraint profile_phone_book_phone_len check (char_length(trim(phone)) between 5 and 40)
);

create index profile_phone_book_user_id_idx on public.profile_phone_book (user_id);

comment on table public.profile_phone_book is 'Kayıtlı teslimat/iletişim numaraları; sipariş OTP doğrulamasından ayrıdır.';

alter table public.profile_phone_book enable row level security;

create policy profile_phone_book_select_own on public.profile_phone_book
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy profile_phone_book_insert_own on public.profile_phone_book
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy profile_phone_book_update_own on public.profile_phone_book
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy profile_phone_book_delete_own on public.profile_phone_book
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy profile_phone_book_superadmin_all on public.profile_phone_book
  for all to authenticated
  using (is_superadmin())
  with check (is_superadmin());
