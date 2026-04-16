"use client";

import { useState } from "react";
import { SmartAddressField } from "@/components/address/SmartAddressField";
import type { CustomerAddressRow } from "@/types/database";

type Props = {
  savedAddresses: CustomerAddressRow[];
  label?: string;
  defaultValue?: string;
};

export function SmartAddressFieldInput({
  savedAddresses,
  label,
  defaultValue = "",
}: Props) {
  const [value, setValue] = useState(defaultValue);
  return <SmartAddressField value={value} onChange={setValue} savedAddresses={savedAddresses} label={label} />;
}

