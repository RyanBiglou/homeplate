"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileStepProps {
  onNext: (data: { name: string; bio: string; cuisineTypes: string[] }) => void;
}

export function ProfileStep({ onNext }: ProfileStepProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onNext({
      name: form.get("name") as string,
      bio: form.get("bio") as string,
      cuisineTypes: (form.get("cuisines") as string).split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Your Name</Label>
        <Input id="name" name="name" required placeholder="Full name" />
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" placeholder="Tell customers about your cooking..." rows={3} />
      </div>
      <div>
        <Label htmlFor="cuisines">Cuisine Types (comma-separated)</Label>
        <Input id="cuisines" name="cuisines" placeholder="Mexican, Indian, Italian" />
      </div>
      <Button type="submit" className="w-full bg-homeplate-orange hover:bg-homeplate-orange-dark">
        Continue
      </Button>
    </form>
  );
}
