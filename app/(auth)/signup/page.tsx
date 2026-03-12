"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChefHat, Loader2, UtensilsCrossed, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Role = "customer" | "cook";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("users").upsert({
        id: data.user.id,
        email,
        name,
        role,
      });

      if (role === "cook") {
        router.push("/onboarding");
      } else {
        router.push("/browse");
      }
      router.refresh();
    }

    setLoading(false);
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${role === "cook" ? "/onboarding" : "/browse"}&role=${role}`,
      },
    });

    if (error) {
      toast.error(error.message);
      setGoogleLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-homeplate-orange">
          <ChefHat className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Join HomePlate as a customer or cook</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
              role === "customer"
                ? "border-homeplate-orange bg-homeplate-cream"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <ShoppingBag
              className={cn(
                "h-6 w-6",
                role === "customer"
                  ? "text-homeplate-orange"
                  : "text-gray-400"
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                role === "customer" ? "text-homeplate-dark" : "text-gray-500"
              )}
            >
              I want to eat
            </span>
          </button>
          <button
            type="button"
            onClick={() => setRole("cook")}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
              role === "cook"
                ? "border-homeplate-orange bg-homeplate-cream"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <UtensilsCrossed
              className={cn(
                "h-6 w-6",
                role === "cook" ? "text-homeplate-orange" : "text-gray-400"
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                role === "cook" ? "text-homeplate-dark" : "text-gray-500"
              )}
            >
              I want to cook
            </span>
          </button>
        </div>

        {role === "cook" && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            You&apos;ll need a valid MEHKO permit from an{" "}
            <Link
              href="/signup/cook"
              className="font-medium underline"
            >
              approved California county
            </Link>{" "}
            to sell meals.
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignup}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or sign up with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-homeplate-orange hover:bg-homeplate-orange/90"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {role === "cook" ? "Sign Up & Start Onboarding" : "Create Account"}
          </Button>
        </form>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-homeplate-orange hover:underline"
          >
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
