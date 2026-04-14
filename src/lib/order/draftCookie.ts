import { cookies } from "next/headers";
import { orderDraftSchema, type OrderDraft } from "@/lib/order/draftSchema";

const COOKIE = "aladdin_order_draft";

export async function getOrderDraft(): Promise<OrderDraft | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return orderDraftSchema.parse(parsed);
  } catch {
    return null;
  }
}

export async function setOrderDraft(draft: OrderDraft) {
  const jar = await cookies();
  jar.set(COOKIE, JSON.stringify(draft), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 6,
  });
}

export async function clearOrderDraft() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
