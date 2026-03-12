"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  CheckCircle2,
  XCircle,
  MapPin,
  Loader2,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface CookPermit {
  id: string;
  name: string;
  email: string;
  permitNumber: string;
  county: string | null;
  permitVerified: boolean;
  active: boolean;
  createdAt: string | null;
  cuisineTypes: string[];
}

export function PermitsManager({ cooks: initial }: { cooks: CookPermit[] }) {
  const [cooks, setCooks] = useState(initial);
  const [filter, setFilter] = useState<"pending" | "verified" | "all">(
    "pending"
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = cooks.filter((c) => {
    if (filter === "pending") return !c.permitVerified;
    if (filter === "verified") return c.permitVerified;
    return true;
  });

  const counts = {
    all: cooks.length,
    pending: cooks.filter((c) => !c.permitVerified).length,
    verified: cooks.filter((c) => c.permitVerified).length,
  };

  async function handleApprove(id: string, approved: boolean) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/permits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      if (res.ok) {
        setCooks((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, permitVerified: approved, active: approved }
              : c
          )
        );
        toast.success(approved ? "Permit approved" : "Permit rejected");
      } else {
        toast.error("Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-homeplate-dark">
            Permit Review
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and verify MEHKO cook permits
          </p>
        </div>
        {counts.pending > 0 && (
          <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">
            {counts.pending} pending
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(["pending", "verified", "all"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? "bg-homeplate-orange hover:bg-homeplate-orange-dark"
                : ""
            }
          >
            <Filter className="mr-1 h-3 w-3" />
            {f === "pending"
              ? `Pending (${counts.pending})`
              : f === "verified"
              ? `Verified (${counts.verified})`
              : `All (${counts.all})`}
          </Button>
        ))}
      </div>

      {/* Cook list */}
      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-green-300" />
              <p className="mt-3 text-sm text-muted-foreground">
                No cooks in this category.
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((cook) => (
            <Card
              key={cook.id}
              className={
                !cook.permitVerified ? "border-l-4 border-l-yellow-400" : ""
              }
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-homeplate-dark">
                        {cook.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {cook.email}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-xs"
                      >
                        <Shield className="h-3 w-3" />
                        {cook.permitNumber}
                      </Badge>
                      {cook.county && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 text-xs"
                        >
                          <MapPin className="h-3 w-3" />
                          {cook.county}
                        </Badge>
                      )}
                      {cook.cuisineTypes.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Applied:{" "}
                      {cook.createdAt
                        ? new Date(cook.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {cook.permitVerified ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(cook.id, true)}
                          disabled={loadingId === cook.id}
                        >
                          {loadingId === cook.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleApprove(cook.id, false)}
                          disabled={loadingId === cook.id}
                        >
                          <XCircle className="mr-1 h-3 w-3" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
