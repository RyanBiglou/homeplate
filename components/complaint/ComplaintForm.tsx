"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ComplaintFormProps {
  orderId: string;
  cookId: string;
}

export function ComplaintForm({ orderId, cookId }: ComplaintFormProps) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, cookId, description }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-green-600">
            Your complaint has been submitted. Our team will review it.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          Report a Food Safety Issue
        </CardTitle>
        <CardDescription>
          Your report helps maintain food safety standards.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Describe the issue</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the food safety concern..."
              rows={4}
              required
            />
          </div>
          <Button
            type="submit"
            variant="destructive"
            disabled={loading || !description.trim()}
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
