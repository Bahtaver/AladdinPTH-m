-- Araç yıkama + isteğe bağlı rötuş tek hizmette; ayrı "touch-up-paint" vitrin dışı.
-- Rötuş satırı: match_criteria {"touch_up_requested": true}, stackable true
-- Uygulandı: Supabase MCP apply_migration (aladdin-app) — yerel dosya uzak sürümle hizalı.

begin;

update public.services
set
  name = 'Araç yıkama ve bakımı',
  short_description =
    'Paket ve araç sınıfı seçin; isterseniz aynı ziyarette küçük çizik rötuş boyası ekleyin.'
where slug = 'car-wash';

update public.pricing_rules pr
set
  service_id = cw.id,
  match_criteria = jsonb_build_object('touch_up_requested', true),
  stackable = true
from (select id from public.services where slug = 'car-wash' limit 1) cw
where pr.service_id = (select id from public.services where slug = 'touch-up-paint' limit 1)
  and coalesce(pr.is_active, true) = true;

update public.pricing_rules
set is_active = false
where service_id = (select id from public.services where slug = 'touch-up-paint' limit 1);

update public.services
set is_active = false
where slug = 'touch-up-paint';

commit;
