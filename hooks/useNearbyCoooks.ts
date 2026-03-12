"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

type CookProfile = Omit<Tables<"cook_profiles">, "address">;

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface Filters {
  cuisine?: string;
  county?: string;
  fulfillmentType?: string;
}

export function useNearbyCooks(bounds: MapBounds | null, filters: Filters = {}) {
  const [cooks, setCooks] = useState<CookProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCooks = useCallback(async () => {
    if (!bounds) return;

    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("cook_profiles")
      .select("id, user_id, bio, cuisine_types, county, permit_number, permit_verified, lat, lng, active, profile_photo_url, created_at, updated_at, total_weekly_meals, total_daily_meals, last_meal_reset_date, last_week_reset_date")
      .eq("active", true)
      .eq("permit_verified", true)
      .gte("lat", bounds.south)
      .lte("lat", bounds.north)
      .gte("lng", bounds.west)
      .lte("lng", bounds.east);

    if (filters.county) {
      query = query.eq("county", filters.county);
    }
    if (filters.cuisine) {
      query = query.contains("cuisine_types", [filters.cuisine]);
    }

    const { data, error } = await query;

    if (!error && data) {
      setCooks(data as CookProfile[]);
    }
    setLoading(false);
  }, [bounds, filters.county, filters.cuisine]);

  useEffect(() => {
    fetchCooks();
  }, [fetchCooks]);

  return { cooks, loading, refetch: fetchCooks };
}
