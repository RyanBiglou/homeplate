import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CookProfile } from "@/components/cook/CookProfile";
import { CookMenuDisplay } from "./menu-display";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Clock, MapPin } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createServerSupabaseClient();
  const { data: cook } = await supabase
    .from("cook_profiles")
    .select()
    .eq("id", params.id)
    .single();

  if (!cook) return { title: "Cook Not Found — HomePlate" };

  const { data: user } = cook.user_id
    ? await supabase.from("users").select().eq("id", cook.user_id).single()
    : { data: null };

  return {
    title: `${user?.name ?? "Home Cook"} — HomePlate`,
    description: cook.bio ?? "MEHKO-permitted home cook on HomePlate",
  };
}

export default async function CookProfilePage({ params }: Props) {
  const supabase = await createServerSupabaseClient();

  const { data: cook } = await supabase
    .from("cook_profiles")
    .select()
    .eq("id", params.id)
    .single();

  if (!cook) notFound();

  const { data: user } = cook.user_id
    ? await supabase.from("users").select().eq("id", cook.user_id).single()
    : { data: null };

  const cookName = user?.name ?? "Home Cook";

  const today = new Date().toISOString().split("T")[0];

  const { data: todayMenu } = await supabase
    .from("menus")
    .select()
    .eq("cook_id", cook.id)
    .eq("date", today)
    .eq("active", true)
    .single();

  let menuItems: Array<{
    id: string;
    menu_id: string;
    name: string;
    description: string | null;
    price: number;
    photo_url: string | null;
    dietary_tags: string[];
    available_qty: number | null;
    qty_remaining: number | null;
    sold_out: boolean;
  }> = [];

  if (todayMenu) {
    const { data } = await supabase
      .from("menu_items")
      .select()
      .eq("menu_id", todayMenu.id)
      .order("created_at", { ascending: true });

    menuItems = (data ?? []).map((item) => ({
      id: item.id,
      menu_id: item.menu_id,
      name: item.name,
      description: item.description,
      price: item.price,
      photo_url: item.photo_url,
      dietary_tags: item.dietary_tags,
      available_qty: item.available_qty,
      qty_remaining: item.qty_remaining,
      sold_out: item.sold_out,
    }));
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select()
    .eq("cook_id", cook.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const reviewList = reviews ?? [];
  const avgRating =
    reviewList.length > 0
      ? reviewList.reduce((s, r) => s + r.rating, 0) / reviewList.length
      : null;

  const { data: customerNames } = reviewList.length > 0
    ? await supabase
        .from("users")
        .select()
        .in("id", reviewList.filter(r => r.customer_id).map(r => r.customer_id!))
    : { data: [] };

  const nameMap = Object.fromEntries(
    (customerNames ?? []).map((u) => [u.id, u.name])
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <CookProfile
        name={cookName}
        bio={cook.bio}
        cuisineTypes={cook.cuisine_types}
        county={cook.county}
        permitNumber={cook.permit_number}
        profilePhotoUrl={cook.profile_photo_url}
        permitVerified={cook.permit_verified}
      />

      {/* Stats row */}
      {(avgRating !== null || todayMenu) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {avgRating !== null && (
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {avgRating.toFixed(1)} ({reviewList.length} review
              {reviewList.length !== 1 ? "s" : ""})
            </Badge>
          )}
          {todayMenu && (
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <Clock className="h-3.5 w-3.5" />
              {todayMenu.available_from && todayMenu.available_until
                ? `${todayMenu.available_from} – ${todayMenu.available_until}`
                : "Available today"}
            </Badge>
          )}
          {todayMenu?.fulfillment_types && todayMenu.fulfillment_types.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <MapPin className="h-3.5 w-3.5" />
              {todayMenu.fulfillment_types
                .map((t: string) => t === "dine_in" ? "Dine-in" : t.charAt(0).toUpperCase() + t.slice(1))
                .join(", ")}
            </Badge>
          )}
        </div>
      )}

      {/* Today's Menu */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-homeplate-dark">
          Today&apos;s Menu
        </h2>
        {todayMenu?.notes && (
          <p className="mt-1 text-sm text-gray-500">{todayMenu.notes}</p>
        )}

        {todayMenu ? (
          <CookMenuDisplay
            menuId={todayMenu.id}
            cookId={cook.id}
            initialItems={menuItems}
            mealsRemaining={todayMenu.meals_remaining}
            fulfillmentTypes={todayMenu.fulfillment_types}
          />
        ) : (
          <Card className="mt-4">
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No menu available today. Check back later!
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Reviews */}
      {reviewList.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-homeplate-dark">Reviews</h2>
          <div className="mt-4 space-y-4">
            {reviewList.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {review.customer_id
                        ? nameMap[review.customer_id] ?? "Customer"
                        : "Customer"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-gray-600">
                      {review.comment}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
