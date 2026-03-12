import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BrowseClient } from "./browse-client";

export const metadata = {
  title: "Browse Cooks — HomePlate",
  description: "Find MEHKO-permitted home cooks near you.",
};

export default async function BrowsePage() {
  const supabase = await createServerSupabaseClient();

  const { data: cooks } = await supabase
    .from("cook_profiles")
    .select()
    .eq("active", true)
    .eq("permit_verified", true);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const safeCooks = (cooks ?? []).map(({ address, ...rest }) => rest);

  const cookUserIds = safeCooks
    .map((c) => c.user_id)
    .filter((id): id is string => id !== null);

  let userNames: Record<string, string | null> = {};
  if (cookUserIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select()
      .in("id", cookUserIds);
    userNames = Object.fromEntries(
      (users ?? []).map((u) => [u.id, u.name])
    );
  }

  const enrichedCooks = safeCooks.map((cook) => ({
    id: cook.id,
    userId: cook.user_id,
    name: cook.user_id ? userNames[cook.user_id] ?? "Home Cook" : "Home Cook",
    bio: cook.bio,
    cuisineTypes: cook.cuisine_types,
    county: cook.county,
    permitNumber: cook.permit_number,
    profilePhotoUrl: cook.profile_photo_url,
    lat: cook.lat,
    lng: cook.lng,
    permitVerified: cook.permit_verified,
  }));

  return <BrowseClient initialCooks={enrichedCooks} />;
}
