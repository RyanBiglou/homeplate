"use client";

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
import { APPROVED_COUNTIES } from "@/lib/counties";
import { useState } from "react";

interface PermitStepProps {
  onNext: (data: { permitNumber: string; county: string }) => void;
  onBack: () => void;
}

export function PermitStep({ onNext, onBack }: PermitStepProps) {
  const [county, setCounty] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onNext({
      permitNumber: form.get("permitNumber") as string,
      county,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="permitNumber">MEHKO Permit Number</Label>
        <Input
          id="permitNumber"
          name="permitNumber"
          required
          placeholder="Enter your permit number"
        />
      </div>
      <div>
        <Label>County</Label>
        <Select value={county} onValueChange={setCounty} required>
          <SelectTrigger>
            <SelectValue placeholder="Select your county" />
          </SelectTrigger>
          <SelectContent>
            {APPROVED_COUNTIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1 bg-homeplate-orange hover:bg-homeplate-orange-dark" disabled={!county}>
          Continue
        </Button>
      </div>
    </form>
  );
}
