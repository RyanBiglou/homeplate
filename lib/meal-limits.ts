import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./supabase/types";

const DAILY_LIMIT = 30;
const WEEKLY_LIMIT = 90;

interface MealLimitResult {
  allowed: boolean;
  reason?: string;
  dailyTotal?: number;
  weeklyTotal?: number;
}

function getStartOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = start of week
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

interface OrderWithItems {
  order_items: { quantity: number }[];
}

function sumMeals(orders: OrderWithItems[] | null): number {
  if (!orders) return 0;
  return orders.reduce(
    (sum, order) =>
      sum +
      order.order_items.reduce(
        (itemSum, item) => itemSum + item.quantity,
        0
      ),
    0
  );
}

/**
 * LEGAL REQUIREMENT: MEHKO cooks are limited to 30 meals/day and 90 meals/week.
 * This check MUST run before every order creation.
 */
export async function checkMealLimits(
  supabase: SupabaseClient<Database>,
  cookId: string,
  requestedMeals: number
): Promise<MealLimitResult> {
  const today = new Date().toISOString().split("T")[0];
  const startOfWeek = getStartOfWeek();

  const { data: dailyOrders } = await supabase
    .from("orders")
    .select("order_items(quantity)")
    .eq("cook_id", cookId)
    .gte("created_at", `${today}T00:00:00`)
    .not("status", "eq", "cancelled") as { data: OrderWithItems[] | null };

  const dailyTotal = sumMeals(dailyOrders);
  if (dailyTotal + requestedMeals > DAILY_LIMIT) {
    return {
      allowed: false,
      reason: `Cook has reached the ${DAILY_LIMIT} meal daily limit`,
      dailyTotal,
    };
  }

  const { data: weeklyOrders } = await supabase
    .from("orders")
    .select("order_items(quantity)")
    .eq("cook_id", cookId)
    .gte("created_at", startOfWeek)
    .not("status", "eq", "cancelled") as { data: OrderWithItems[] | null };

  const weeklyTotal = sumMeals(weeklyOrders);
  if (weeklyTotal + requestedMeals > WEEKLY_LIMIT) {
    return {
      allowed: false,
      reason: `Cook has reached the ${WEEKLY_LIMIT} meal weekly limit`,
      weeklyTotal,
    };
  }

  return { allowed: true, dailyTotal, weeklyTotal };
}
