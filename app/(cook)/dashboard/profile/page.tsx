"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function CookProfileEditPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [cuisineTypes, setCuisineTypes] = useState("");
  const [address, setAddress] = useState("");
  const [permitNumber, setPermitNumber] = useState("");
  const [county, setCounty] = useState("");
  const [permitVerified, setPermitVerified] = useState(false);
  const [stripeComplete, setStripeComplete] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select()
        .eq("id", user.id)
        .single();

      const { data: profile } = await supabase
        .from("cook_profiles")
        .select()
        .eq("user_id", user.id)
        .single();

      if (userData) {
        setName(userData.name ?? "");
        setStripeComplete(userData.stripe_onboarding_complete);
      }

      if (profile) {
        setBio(profile.bio ?? "");
        setCuisineTypes(profile.cuisine_types?.join(", ") ?? "");
        setAddress(profile.address ?? "");
        setPermitNumber(profile.permit_number);
        setCounty(profile.county);
        setPermitVerified(profile.permit_verified);
      }

      setLoading(false);
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("users").update({ name }).eq("id", user.id);

    await supabase
      .from("cook_profiles")
      .update({
        bio: bio || null,
        cuisine_types: cuisineTypes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        address: address || null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    toast.success("Profile updated");
    setSaving(false);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-homeplate-orange" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-homeplate-dark">Your Profile</h1>
      <p className="text-gray-600">Manage your cook profile and settings</p>

      {/* Status badges */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge
          variant={permitVerified ? "default" : "outline"}
          className={
            permitVerified
              ? "bg-green-100 text-green-800"
              : "border-amber-500 text-amber-700"
          }
        >
          <ShieldCheck className="mr-1 h-3 w-3" />
          {permitVerified ? "Permit Verified" : "Permit Pending"}
        </Badge>
        <Badge
          variant={stripeComplete ? "default" : "outline"}
          className={
            stripeComplete
              ? "bg-green-100 text-green-800"
              : "border-gray-400 text-gray-600"
          }
        >
          {stripeComplete ? (
            <CheckCircle2 className="mr-1 h-3 w-3" />
          ) : (
            <Lock className="mr-1 h-3 w-3" />
          )}
          {stripeComplete ? "Stripe Connected" : "Stripe Not Connected"}
        </Badge>
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell customers about your cooking style..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="cuisines">Cuisine Types (comma-separated)</Label>
              <Input
                id="cuisines"
                value={cuisineTypes}
                onChange={(e) => setCuisineTypes(e.target.value)}
                placeholder="Mexican, Indian, Italian"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Permit & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Permit Number</Label>
              <Input value={permitNumber} disabled className="bg-gray-50" />
              <p className="mt-1 text-xs text-gray-500">
                Contact support to update your permit number
              </p>
            </div>
            <div>
              <Label>County</Label>
              <Input value={county} disabled className="bg-gray-50" />
            </div>
            <Separator />
            <div>
              <Label htmlFor="address">Kitchen Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <Lock className="h-3 w-3" />
                Only revealed to customers after payment
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-homeplate-orange hover:bg-homeplate-orange/90"
          disabled={saving}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </main>
  );
}
