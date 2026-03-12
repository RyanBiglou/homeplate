import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ChefHat, MapPin, Shield, Clock, Star, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const { data: featuredCooks } = await supabase
    .from("cook_profiles")
    .select()
    .eq("active", true)
    .eq("permit_verified", true)
    .limit(6);

  const cooks = featuredCooks ?? [];

  const userIds = cooks
    .map((c) => c.user_id)
    .filter(Boolean) as string[];

  const { data: users } = userIds.length > 0
    ? await supabase.from("users").select().in("id", userIds)
    : { data: [] };

  const userMap = Object.fromEntries(
    (users ?? []).map((u) => [u.id, u])
  );

  const cookIds = cooks.map((c) => c.id);
  const { data: reviewData } = cookIds.length > 0
    ? await supabase.from("reviews").select().in("cook_id", cookIds)
    : { data: [] };

  const ratingByCook: Record<string, { sum: number; count: number }> = {};
  (reviewData ?? []).forEach((r) => {
    if (!r.cook_id) return;
    if (!ratingByCook[r.cook_id]) ratingByCook[r.cook_id] = { sum: 0, count: 0 };
    ratingByCook[r.cook_id].sum += r.rating;
    ratingByCook[r.cook_id].count++;
  });

  return (
    <main>
      {/* Hero */}
      <section className="relative bg-homeplate-cream">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-homeplate-dark sm:text-5xl lg:text-6xl">
              Home-cooked meals,{" "}
              <span className="text-homeplate-orange">made with love</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Discover permitted home cooks in your neighborhood. Fresh,
              same-day meals from real kitchens — not restaurants.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/browse">
                <Button
                  size="lg"
                  className="w-full bg-homeplate-orange text-lg hover:bg-homeplate-orange-dark sm:w-auto"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Find Cooks Near You
                </Button>
              </Link>
              <Link href="/signup/cook">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-homeplate-orange text-homeplate-orange hover:bg-homeplate-orange/10 sm:w-auto"
                >
                  <ChefHat className="mr-2 h-5 w-5" />
                  Become a Cook
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-homeplate-dark">
            How HomePlate Works
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: MapPin,
                title: "Discover",
                desc: "Find MEHKO-permitted home cooks in your California neighborhood using our interactive map.",
              },
              {
                icon: Clock,
                title: "Order Same-Day",
                desc: "Browse today's menu and place your order. All meals are prepared fresh the same day.",
              },
              {
                icon: Shield,
                title: "Safe & Permitted",
                desc: "Every cook holds a valid MEHKO permit. We verify permits and enforce food safety standards.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-homeplate-cream">
                  <item.icon className="h-7 w-7 text-homeplate-orange" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-homeplate-dark">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cooks */}
      {cooks.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-homeplate-dark">
                Featured Cooks
              </h2>
              <Link
                href="/browse"
                className="flex items-center gap-1 text-sm font-medium text-homeplate-orange hover:underline"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cooks.map((cook) => {
                const user = cook.user_id ? userMap[cook.user_id] : null;
                const rating = ratingByCook[cook.id];
                const avg = rating ? rating.sum / rating.count : null;

                return (
                  <Link key={cook.id} href={`/cooks/${cook.id}`}>
                    <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-md">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-homeplate-cream text-2xl">
                            🍳
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-semibold text-homeplate-dark">
                              {user?.name ?? "Home Cook"}
                            </h3>
                            {cook.bio && (
                              <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                {cook.bio}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-green-200 bg-green-50 text-xs text-green-700"
                          >
                            <Shield className="mr-1 h-3 w-3" />
                            MEHKO Permit
                          </Badge>
                          {cook.county && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="mr-1 h-3 w-3" />
                              {cook.county}
                            </Badge>
                          )}
                          {avg !== null && (
                            <Badge variant="outline" className="text-xs">
                              <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {avg.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {cook.cuisine_types.slice(0, 3).map((t) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="text-xs"
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-3 text-xs italic text-muted-foreground">
                          Made in a Home Kitchen
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-homeplate-orange py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white">
            Ready to share your cooking?
          </h2>
          <p className="mt-4 text-lg text-orange-100">
            If you have a MEHKO permit, join HomePlate and start earning by
            doing what you love.
          </p>
          <Link href="/signup/cook">
            <Button
              size="lg"
              className="mt-8 bg-white text-homeplate-orange hover:bg-orange-50"
            >
              Get Started as a Cook
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
