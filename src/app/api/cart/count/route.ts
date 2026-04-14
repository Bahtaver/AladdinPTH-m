import { NextResponse } from "next/server";
import { getMyCartWithItems } from "@/app/actions/cartActions";

export async function GET() {
  const bundle = await getMyCartWithItems();
  const count = bundle?.items.length ?? 0;
  return NextResponse.json({ count });
}
