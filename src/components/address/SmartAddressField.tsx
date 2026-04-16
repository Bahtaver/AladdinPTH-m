"use client";

import { useMemo, useState } from "react";
import type { CustomerAddressRow } from "@/types/database";

type Props = {
  value: string;
  onChange: (next: string) => void;
  savedAddresses: CustomerAddressRow[];
  label?: string;
};

type AntalyaDistrict = {
  name: string;
  neighborhoods: { name: string; streets: string[] }[];
};

const ANTALYA_DISTRICTS: AntalyaDistrict[] = [
  {
    name: "Muratpasa",
    neighborhoods: [
      { name: "Fener", streets: ["Tekelioglu Cd.", "Lara Cd.", "1971 Sk."] },
      { name: "Guzeloba", streets: ["Rauf Denktas Cd.", "2290 Sk.", "2408 Sk."] },
      { name: "Caglayan", streets: ["Barinaklar Blv.", "2054 Sk.", "2049 Sk."] },
    ],
  },
  {
    name: "Konyaalti",
    neighborhoods: [
      { name: "Hurma", streets: ["Bogacay Cd.", "226 Sk.", "228 Sk."] },
      { name: "Liman", streets: ["Liman Cd.", "33 Sk.", "25 Sk."] },
      { name: "Uncali", streets: ["Ataturk Blv.", "1227 Sk.", "1229 Sk."] },
    ],
  },
  {
    name: "Kepez",
    neighborhoods: [
      { name: "Varsak", streets: ["Suleyman Demirel Blv.", "1061 Sk.", "1058 Sk."] },
      { name: "Gultepe", streets: ["Sakarya Blv.", "3012 Sk.", "3016 Sk."] },
      { name: "Yeniemek", streets: ["3073 Sk.", "3075 Sk.", "3079 Sk."] },
    ],
  },
  {
    name: "Alanya",
    neighborhoods: [
      { name: "Mahmutlar", streets: ["Barbaros Cd.", "107 Sk.", "109 Sk."] },
      { name: "Oba", streets: ["Oba Cd.", "Mese Sk.", "Akasya Sk."] },
      { name: "Kestel", streets: ["Sahil Cd.", "Ihlamur Sk.", "Menekse Sk."] },
    ],
  },
];

const POPULAR_DISTRICTS = ["Muratpasa", "Konyaalti", "Kepez"];

type DraftAddress = {
  district: string;
  neighborhood: string;
  street: string;
  buildingNo: string;
  building: string;
  apartment: string;
  floor: string;
};

const EMPTY_DRAFT: DraftAddress = {
  district: "",
  neighborhood: "",
  street: "",
  buildingNo: "",
  building: "",
  apartment: "",
  floor: "",
};

function composeAddressLine(d: DraftAddress): string {
  const details = [
    d.buildingNo ? `No:${d.buildingNo}` : "",
    d.building ? `Bina:${d.building}` : "",
    d.apartment ? `Daire:${d.apartment}` : "",
    d.floor ? `Kat:${d.floor}` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `Antalya / ${d.district} / ${d.neighborhood}, ${d.street} ${details}`.trim();
}

export function SmartAddressField({ value, onChange, savedAddresses, label = "Hizmet adresi" }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<DraftAddress>(EMPTY_DRAFT);
  const [manualStreet, setManualStreet] = useState(false);

  const districtOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...ANTALYA_DISTRICTS].sort((a, b) => {
      const ap = POPULAR_DISTRICTS.includes(a.name) ? 0 : 1;
      const bp = POPULAR_DISTRICTS.includes(b.name) ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return a.name.localeCompare(b.name, "tr");
    });
    if (!q) return sorted;
    return sorted.filter((d) => d.name.toLowerCase().includes(q));
  }, [query]);

  const neighborhoodOptions = useMemo(() => {
    const d = ANTALYA_DISTRICTS.find((x) => x.name === draft.district);
    if (!d) return [];
    const q = query.trim().toLowerCase();
    if (!q) return d.neighborhoods;
    return d.neighborhoods.filter((n) => n.name.toLowerCase().includes(q));
  }, [draft.district, query]);

  const streetOptions = useMemo(() => {
    const d = ANTALYA_DISTRICTS.find((x) => x.name === draft.district);
    const n = d?.neighborhoods.find((x) => x.name === draft.neighborhood);
    if (!n) return [];
    const q = query.trim().toLowerCase();
    if (!q) return n.streets;
    return n.streets.filter((s) => s.toLowerCase().includes(q));
  }, [draft.district, draft.neighborhood, query]);

  const livePreview = useMemo(() => {
    if (!draft.district) return "Antalya";
    if (!draft.neighborhood) return `Antalya / ${draft.district}`;
    if (!draft.street) return `Antalya / ${draft.district} / ${draft.neighborhood}`;
    return composeAddressLine(draft);
  }, [draft]);

  const canSave = Boolean(
    draft.district && draft.neighborhood && draft.street && draft.buildingNo.trim().length > 0,
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm text-zinc-700 dark:text-zinc-200">
        <span className="font-medium">{label}</span>
      </label>
      <div className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Adres onizleme</p>
        <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">
          {value || "Antalya / Ilce / Mahalle / Sokak"}
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setStep(1);
            setQuery("");
          }}
          className="mt-3 inline-flex rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
        >
          Adresi sec veya duzenle
        </button>
      </div>
      <input type="hidden" name="address_line" value={value} />

      {open ? (
        <div className="fixed inset-0 z-[220] bg-black/40 p-0 sm:p-4">
          <div className="mt-16 flex h-[calc(100vh-4rem)] flex-col rounded-t-3xl bg-white shadow-xl dark:bg-zinc-950 sm:mx-auto sm:mt-6 sm:h-[85vh] sm:max-w-xl sm:rounded-3xl">
            <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Antalya</p>
              <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{livePreview}</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {savedAddresses.length > 0 && step === 1 ? (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Kayitli adreslerden hizli sec
                  </p>
                  <div className="space-y-2">
                    {savedAddresses.slice(0, 3).map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          onChange(a.address_line);
                          setOpen(false);
                        }}
                        className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-left text-sm hover:border-emerald-300 dark:border-zinc-700 dark:hover:border-emerald-700"
                      >
                        <p className="font-medium text-zinc-800 dark:text-zinc-100">{a.label || "Adres"}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{a.address_line}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mb-3">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {step === 1
                    ? "Ilce secin"
                    : step === 2
                      ? "Mahalle secin"
                      : step === 3
                        ? "Sokak veya cadde"
                        : "Bina ve daire bilgisi"}
                </p>
              </div>

              {step < 4 ? (
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={step === 1 ? "Ilce ara" : step === 2 ? "Mahalle ara" : "Sokak ara"}
                  className="mb-3 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500/40 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950"
                />
              ) : null}

              {step === 1 ? (
                <div className="space-y-2">
                  {districtOptions.map((d) => (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => {
                        setDraft((prev) => ({ ...prev, district: d.name, neighborhood: "", street: "" }));
                        setQuery("");
                        setStep(2);
                      }}
                      className="w-full rounded-2xl border border-zinc-200 px-3 py-3 text-left text-sm font-medium hover:border-emerald-300 dark:border-zinc-700 dark:hover:border-emerald-700"
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-2">
                  {neighborhoodOptions.map((n) => (
                    <button
                      key={n.name}
                      type="button"
                      onClick={() => {
                        setDraft((prev) => ({ ...prev, neighborhood: n.name, street: "" }));
                        setQuery("");
                        setStep(3);
                      }}
                      className="w-full rounded-2xl border border-zinc-200 px-3 py-3 text-left text-sm font-medium hover:border-emerald-300 dark:border-zinc-700 dark:hover:border-emerald-700"
                    >
                      {n.name}
                    </button>
                  ))}
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-2">
                  {!manualStreet ? (
                    <>
                      {streetOptions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setDraft((prev) => ({ ...prev, street: s }));
                            setStep(4);
                            setQuery("");
                          }}
                          className="w-full rounded-2xl border border-zinc-200 px-3 py-3 text-left text-sm font-medium hover:border-emerald-300 dark:border-zinc-700 dark:hover:border-emerald-700"
                        >
                          {s}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setManualStreet(true)}
                        className="w-full rounded-2xl border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                      >
                        Sokagimi listede bulamadim
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <input
                        value={draft.street}
                        onChange={(e) => setDraft((prev) => ({ ...prev, street: e.target.value }))}
                        placeholder="Sokak/Cadde adi"
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500/40 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (draft.street.trim()) setStep(4);
                        }}
                        className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                      >
                        Devam
                      </button>
                    </div>
                  )}
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={draft.buildingNo}
                      onChange={(e) => setDraft((prev) => ({ ...prev, buildingNo: e.target.value }))}
                      placeholder="No*"
                      inputMode="numeric"
                      className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500/40 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                    <input
                      value={draft.building}
                      onChange={(e) => setDraft((prev) => ({ ...prev, building: e.target.value }))}
                      placeholder="Bina"
                      className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500/40 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                    <input
                      value={draft.apartment}
                      onChange={(e) => setDraft((prev) => ({ ...prev, apartment: e.target.value }))}
                      placeholder="Daire"
                      inputMode="numeric"
                      className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500/40 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                    <input
                      value={draft.floor}
                      onChange={(e) => setDraft((prev) => ({ ...prev, floor: e.target.value }))}
                      placeholder="Kat"
                      inputMode="numeric"
                      className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500/40 focus:ring-4 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!canSave) return;
                      onChange(composeAddressLine(draft));
                      setOpen(false);
                    }}
                    disabled={!canSave}
                    className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Adresi uygula
                  </button>
                </div>
              ) : null}
            </div>

            <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
                    else setOpen(false);
                  }}
                  className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium dark:border-zinc-700"
                >
                  {step > 1 ? "Geri" : "Kapat"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(EMPTY_DRAFT);
                    setStep(1);
                    setQuery("");
                    setManualStreet(false);
                  }}
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                >
                  Sifirla
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

