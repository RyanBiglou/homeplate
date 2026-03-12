import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const COOK_ROUTES = ["/dashboard"];
const CUSTOMER_ROUTES = ["/orders", "/checkout"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r));
  const isCookRoute = COOK_ROUTES.some((r) => path.startsWith(r));
  const isCustomerRoute = CUSTOMER_ROUTES.some((r) => path.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => path.startsWith(r));
  const isOnboarding = path.startsWith("/onboarding");
  const isProtected = isCookRoute || isCustomerRoute || isAdminRoute || isOnboarding;

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!user && isProtected) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isProtected) {
    const { data: userData } = await supabase
      .from("users")
      .select()
      .eq("id", user.id)
      .single();

    if (userData) {
      if (isCookRoute && userData.role !== "cook" && userData.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      if (isAdminRoute && userData.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      if (isCustomerRoute && userData.role !== "customer" && userData.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      if (userData.role === "cook" && isCookRoute) {
        const { data: cookProfile } = await supabase
          .from("cook_profiles")
          .select()
          .eq("user_id", user.id)
          .single();

        if (!cookProfile && !isOnboarding) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }

        if (
          cookProfile &&
          !cookProfile.permit_verified &&
          !cookProfile.address &&
          !isOnboarding
        ) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
