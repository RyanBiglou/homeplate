"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag, Menu, X, ChefHat } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const { totalItems, toggleCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  const itemCount = totalItems();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <ChefHat className="h-8 w-8 text-homeplate-orange" />
          <span className="text-xl font-bold text-homeplate-dark">
            HomePlate
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/browse"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-homeplate-orange"
          >
            Browse Cooks
          </Link>

          {user?.role === "cook" && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-homeplate-orange"
            >
              Dashboard
            </Link>
          )}

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-homeplate-orange"
            >
              Admin
            </Link>
          )}

          {user?.role === "customer" && (
            <button
              onClick={toggleCart}
              className="relative text-gray-600 transition-colors hover:text-homeplate-orange"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-homeplate-orange text-xs font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-homeplate-orange text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user.name ?? user.email}
                </div>
                <DropdownMenuSeparator />
                {user.role === "customer" && (
                  <DropdownMenuItem onClick={() => router.push("/orders")}>
                    My Orders
                  </DropdownMenuItem>
                )}
                {user.role === "cook" && (
                  <>
                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/earnings")}>
                      Earnings
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="bg-homeplate-orange hover:bg-homeplate-orange-dark"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="border-t bg-white px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="/browse"
              className="py-2 text-sm font-medium text-gray-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Cooks
            </Link>
            {user?.role === "cook" && (
              <Link
                href="/dashboard"
                className="py-2 text-sm font-medium text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {user?.role === "customer" && (
              <Link
                href="/orders"
                className="py-2 text-sm font-medium text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Orders
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="py-2 text-sm font-medium text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {!user && (
              <div className="flex gap-3 pt-2">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button
                    className="w-full bg-homeplate-orange hover:bg-homeplate-orange-dark"
                    size="sm"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            {user && (
              <button
                onClick={handleSignOut}
                className="py-2 text-left text-sm font-medium text-red-600"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
