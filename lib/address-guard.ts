import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./supabase/types";

/**
 * LEGAL REQUIREMENT: Cook home addresses may only be revealed to customers
 * who have a paid, non-cancelled order with that cook.
 * California Retail Food Code Chapter 11.6 (IFSI compliance).
 */
export async function canRevealAddress(
  supabase: SupabaseClient<Database>,
  customerId: string,
  cookId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("orders")
    .select("id")
    .eq("customer_id", customerId)
    .eq("cook_id", cookId)
    .not("status", "eq", "cancelled")
    .not("stripe_payment_intent_id", "is", null)
    .limit(1);

  return (data?.length ?? 0) > 0;
}

/**
 * Strip address fields from cook profile data for public responses.
 * Always use this when returning cook data to non-authorized users.
 */
export function stripAddressFields<
  T extends { address?: string | null; lat?: number | null; lng?: number | null },
>(profile: T): Omit<T, "address"> & { address: undefined } {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { address, ...safe } = profile;
  return { ...safe, address: undefined };
}
