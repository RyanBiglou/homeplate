"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { ProfileStep } from "@/components/onboarding/ProfileStep";
import { PermitStep } from "@/components/onboarding/PermitStep";
import { AddressStep } from "@/components/onboarding/AddressStep";
import { StripeStep } from "@/components/onboarding/StripeStep";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const STEPS = ["Profile", "Permit", "Address", "Payments"];

interface OnboardingData {
  name: string;
  bio: string;
  cuisineTypes: string[];
  permitNumber: string;
  county: string;
  address: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function checkExistingProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("cook_profiles")
        .select()
        .eq("user_id", user.id)
        .single();

      if (profile) {
        if (profile.address && profile.permit_number) {
          setCurrentStep(3);
        } else if (profile.permit_number && profile.county) {
          setCurrentStep(2);
          setData({
            permitNumber: profile.permit_number,
            county: profile.county,
            bio: profile.bio ?? "",
            cuisineTypes: profile.cuisine_types ?? [],
          });
        } else {
          setCurrentStep(0);
        }
      }

      setChecking(false);
    }
    checkExistingProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleProfileStep(profileData: {
    name: string;
    bio: string;
    cuisineTypes: string[];
  }) {
    setData((prev) => ({ ...prev, ...profileData }));

    if (userId) {
      await supabase
        .from("users")
        .update({ name: profileData.name })
        .eq("id", userId);
    }

    setCurrentStep(1);
  }

  async function handlePermitStep(permitData: {
    permitNumber: string;
    county: string;
  }) {
    setData((prev) => ({ ...prev, ...permitData }));

    if (userId) {
      const { data: existing } = await supabase
        .from("cook_profiles")
        .select()
        .eq("user_id", userId)
        .single();

      if (existing) {
        await supabase
          .from("cook_profiles")
          .update({
            permit_number: permitData.permitNumber,
            county: permitData.county,
            bio: data.bio ?? null,
            cuisine_types: data.cuisineTypes ?? [],
          })
          .eq("user_id", userId);
      } else {
        await supabase.from("cook_profiles").insert({
          user_id: userId,
          permit_number: permitData.permitNumber,
          county: permitData.county,
          bio: data.bio ?? null,
          cuisine_types: data.cuisineTypes ?? [],
        });
      }
    }

    setCurrentStep(2);
  }

  async function handleAddressStep(addressData: { address: string }) {
    setData((prev) => ({ ...prev, ...addressData }));

    if (userId) {
      await supabase
        .from("cook_profiles")
        .update({ address: addressData.address })
        .eq("user_id", userId);
    }

    setCurrentStep(3);
  }

  async function handleStripeConnect() {
    setStripeLoading(true);

    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const json = await res.json();

      if (json.url) {
        window.location.href = json.url;
      } else {
        toast.error(json.error ?? "Failed to start Stripe onboarding");
        setStripeLoading(false);
      }
    } catch {
      toast.error("Failed to connect to Stripe");
      setStripeLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="mx-auto flex max-w-2xl items-center justify-center px-4 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-homeplate-orange" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Cook Profile</CardTitle>
          <div className="mt-4">
            <StepIndicator steps={STEPS} currentStep={currentStep} />
          </div>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <ProfileStep onNext={handleProfileStep} />
          )}
          {currentStep === 1 && (
            <PermitStep
              onNext={handlePermitStep}
              onBack={() => setCurrentStep(0)}
            />
          )}
          {currentStep === 2 && (
            <AddressStep
              onNext={handleAddressStep}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <StripeStep
              onConnect={handleStripeConnect}
              onBack={() => setCurrentStep(2)}
              loading={stripeLoading}
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
