import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Plus, ChefHat } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Menu Builder — HomePlate",
};

export default async function MenuBuilderPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: cookProfile } = await supabase
    .from("cook_profiles")
    .select()
    .eq("user_id", user.id)
    .single();

  if (!cookProfile) redirect("/onboarding");

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const { data: menus } = await supabase
    .from("menus")
    .select()
    .eq("cook_id", cookProfile.id)
    .in("date", dates);

  const menuByDate = new Map(
    (menus ?? []).map((m) => [m.date, m])
  );

  const { data: menuItems } = await supabase
    .from("menu_items")
    .select()
    .in(
      "menu_id",
      (menus ?? []).map((m) => m.id)
    );

  const itemsByMenu = new Map<string, number>();
  for (const item of menuItems ?? []) {
    itemsByMenu.set(item.menu_id, (itemsByMenu.get(item.menu_id) ?? 0) + 1);
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-homeplate-dark">Menu Builder</h1>
          <p className="text-gray-600">Plan and publish your daily menus</p>
        </div>
        <Link href={`/dashboard/menu/${dates[0]}`}>
          <Button className="bg-homeplate-orange hover:bg-homeplate-orange/90">
            <Plus className="mr-2 h-4 w-4" />
            Today&apos;s Menu
          </Button>
        </Link>
      </div>

      <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        <ChefHat className="mb-1 inline h-4 w-4" /> All items must include{" "}
        <strong>&quot;Made in a Home Kitchen&quot;</strong> — this is displayed
        automatically. The word &quot;catering&quot; is prohibited per MEHKO law.
      </div>

      <div className="mt-6 space-y-3">
        {dates.map((date) => {
          const d = new Date(date + "T12:00:00");
          const menu = menuByDate.get(date);
          const itemCount = menu ? itemsByMenu.get(menu.id) ?? 0 : 0;
          const isToday = date === dates[0];

          return (
            <Link key={date} href={`/dashboard/menu/${date}`}>
              <Card
                className={`cursor-pointer transition-shadow hover:shadow-md ${
                  isToday ? "border-homeplate-orange" : ""
                }`}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-homeplate-cream">
                      <span className="text-xs font-medium text-gray-500">
                        {dayNames[d.getDay()]}
                      </span>
                      <span className="text-lg font-bold text-homeplate-dark">
                        {d.getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-homeplate-dark">
                        {dayNames[d.getDay()]}, {monthNames[d.getMonth()]}{" "}
                        {d.getDate()}
                        {isToday && (
                          <Badge
                            variant="secondary"
                            className="ml-2 bg-homeplate-orange text-white"
                          >
                            Today
                          </Badge>
                        )}
                      </p>
                      {menu ? (
                        <p className="text-sm text-gray-500">
                          {itemCount} item{itemCount !== 1 ? "s" : ""} ·{" "}
                          {menu.meals_remaining} meals remaining
                          {!menu.active && " · Inactive"}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">
                          No menu set — tap to create
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {menu && (
                      <Badge variant={menu.active ? "default" : "outline"}>
                        {menu.active ? "Active" : "Draft"}
                      </Badge>
                    )}
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
