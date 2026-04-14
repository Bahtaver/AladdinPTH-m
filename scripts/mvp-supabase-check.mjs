/**
 * MVP öncesi: .env içinden URL+anon ile PostgREST okuma ve storage public kontrolü.
 * Çıktıda anahtar yazdırılmaz.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
  const out = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim();
  }
  return out;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL veya ANON_KEY .env içinde yok.");
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  Accept: "application/json",
};

async function rest(path, opts = {}) {
  const r = await fetch(`${url}/rest/v1/${path}`, {
    ...opts,
    headers: { ...headers, ...opts.headers },
  });
  const text = await r.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { ok: r.ok, status: r.status, body };
}

const expectedSlugs = [
  "car-wash",
  "carpet-cleaning",
  "sofa-cleaning",
  "window-cleaning",
];

console.log("--- PostgREST: services (aktif) ---");
const svc = await rest(
  "services?select=id,slug,name,is_active,sort_order&is_active=eq.true&order=sort_order.asc",
);
console.log("HTTP", svc.status, svc.ok ? "OK" : "FAIL");
if (!svc.ok) {
  console.log(typeof svc.body === "object" ? JSON.stringify(svc.body, null, 2) : svc.body);
  process.exit(1);
}
const rows = Array.isArray(svc.body) ? svc.body : [];
const slugs = rows.map((r) => r.slug).filter(Boolean);
console.log("Aktif slug sayısı:", slugs.length);
for (const s of expectedSlugs) {
  console.log(`  ${slugs.includes(s) ? "[+]" : "[!]"} ${s}`);
}
const unexpected = slugs.filter((s) => !expectedSlugs.includes(s));
if (unexpected.length) {
  console.log("  Ek aktif slug(lar):", unexpected.join(", "));
}

console.log("\n--- PostgREST: pricing_rules (car-wash service_id) ---");
const car = rows.find((r) => r.slug === "car-wash");
if (!car?.slug) {
  console.log("[!] car-wash aktif servislerde yok — fiyatlandırma kontrolü atlandı.");
} else {
  const pr = await rest(
    `pricing_rules?select=id,label,stackable,match_criteria,service_id,is_active&service_id=eq.${car.id}&is_active=eq.true`,
  );
  console.log("HTTP", pr.status, pr.ok ? "OK" : "FAIL");
  if (!pr.ok) {
    console.log(typeof pr.body === "object" ? JSON.stringify(pr.body, null, 2) : pr.body);
  } else {
    const rules = Array.isArray(pr.body) ? pr.body : [];
    console.log("Aktif kural sayısı:", rules.length);
    const touch = rules.filter(
      (r) =>
        String(r.label || "").includes("touchup") ||
        (r.match_criteria &&
          typeof r.match_criteria === "object" &&
          r.match_criteria.touch_up_requested === true),
    );
    console.log(
      "Rötuş addon kuralları (label/match):",
      touch.length ? touch.map((t) => t.label).join(", ") : "YOK — migration gerekli olabilir",
    );
    const nonStack = rules.filter((r) => !r.stackable).length;
    const stack = rules.filter((r) => r.stackable).length;
    console.log(`Stackable: ${stack}, non-stackable: ${nonStack}`);
  }
}

console.log("\n--- PostgREST: service_configurations (ilk 5) ---");
const sc = await rest("service_configurations?select=service_id,flow_slug&limit=5");
console.log("HTTP", sc.status, sc.ok ? "OK" : "FAIL");
if (sc.ok && Array.isArray(sc.body)) {
  console.log("Kayıt:", sc.body.length);
}

console.log("\n--- Storage: public service_option_assets (HEAD) ---");
const probe =
  "oto-wash-out-card.png";
const su = await fetch(
  `${url}/storage/v1/object/public/service_option_assets/${probe}`,
  { method: "HEAD" },
);
console.log("HEAD", probe, "→", su.status, su.ok ? "OK" : "FAIL");

console.log("\n--- RLS smoke: orders INSERT (beklenti: 401/403 veya RLS ihlali) ---");
const badInsert = await fetch(`${url}/rest/v1/orders`, {
  method: "POST",
  headers: {
    ...headers,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  },
  body: JSON.stringify({
    customer_id: "00000000-0000-0000-0000-000000000000",
    service_id: car?.id || "00000000-0000-0000-0000-000000000000",
    total_price: 1,
    currency: "TRY",
    configuration_snapshot: {},
    pricing_breakdown: [],
    status: "pending",
  }),
});
const insText = await badInsert.text();
console.log("POST orders (sahte) →", badInsert.status, badInsert.ok ? "unexpected OK" : "beklenen red");
if (!badInsert.ok && insText.length < 500) {
  try {
    console.log(JSON.stringify(JSON.parse(insText), null, 2));
  } catch {
    console.log(insText.slice(0, 200));
  }
}

console.log("\nBitti.");
