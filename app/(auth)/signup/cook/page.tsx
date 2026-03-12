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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChefHat, Loader2, ShieldCheck } from "lucide-react";
import { APPROVED_COUNTIES } from "@/lib/counties";
import { toast } from "sonner";

export default function CookSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [county, setCounty] = useState("");
  const [permitNumber, setPermitNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!county) {
      toast.error("Please select your county");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: "cook" },
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
        role: "cook",
      });

      await supabase.from("cook_profiles").insert({
        user_id: data.user.id,
        permit_number: permitNumber,
        county,
        cuisine_types: [],
      });

      router.push("/onboarding");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-homeplate-orange">
          <ChefHat className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl">Become a HomePlate Cook</CardTitle>
        <CardDescription>
          Create your account with your MEHKO permit details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">MEHKO Permit Required</p>
            <p className="mt-1">
              You must have a valid Microenterprise Home Kitchen Operation permit
              from one of California&apos;s approved counties.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-2">
            <Label>County</Label>
            <Select value={county} onValueChange={setCounty}>
              <SelectTrigger>
                <SelectValue placeholder="Select your county" />
              </SelectTrigger>
              <SelectContent>
                {APPROVED_COUNTIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="permit">MEHKO Permit Number</Label>
            <Input
              id="permit"
              type="text"
              placeholder="Enter your permit number"
              value={permitNumber}
              onChange={(e) => setPermitNumber(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-homeplate-orange hover:bg-homeplate-orange/90"
            disabled={loading || !county}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Cook Account
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
        <div className="text-center text-sm">
          Want to sign up as a customer instead?{" "}
          <Link
            href="/signup"
            className="font-medium text-homeplate-orange hover:underline"
          >
            Customer signup
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
