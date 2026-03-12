"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface ComplaintItem {
  id: string;
  description: string;
  submittedAt: string | null;
  adminReviewed: boolean | null;
  reportedToLea: boolean;
  leaReportDate: string | null;
  cookId: string | null;
  cookName: string;
  customerName: string;
  orderId: string | null;
}

export function ComplaintsManager({
  complaints: initial,
}: {
  complaints: ComplaintItem[];
}) {
  const [complaints, setComplaints] = useState(initial);
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed" | "lea">(
    "pending"
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = complaints.filter((c) => {
    if (filter === "pending") return !c.adminReviewed;
    if (filter === "reviewed") return c.adminReviewed;
    if (filter === "lea") return c.reportedToLea;
    return true;
  });

  async function handleMarkReviewed(id: string) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReviewed: true }),
      });
      if (res.ok) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? { ...c, adminReviewed: true } : c))
        );
        toast.success("Complaint marked as reviewed");
      } else {
        toast.error("Failed to update complaint");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReportToLea(id: string) {
    if (
      !confirm(
        "Report this complaint to the Local Enforcement Agency (LEA)? This action is logged."
      )
    )
      return;

    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedToLea: true,
          adminReviewed: true,
        }),
      });
      if (res.ok) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  reportedToLea: true,
                  adminReviewed: true,
                  leaReportDate: new Date().toISOString(),
                }
              : c
          )
        );
        toast.success("Reported to LEA");
      } else {
        toast.error("Failed to report");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadingId(null);
    }
  }

  const counts = {
    all: complaints.length,
    pending: complaints.filter((c) => !c.adminReviewed).length,
    reviewed: complaints.filter((c) => c.adminReviewed).length,
    lea: complaints.filter((c) => c.reportedToLea).length,
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-homeplate-dark">
            Complaints
          </h1>
          <p className="text-sm text-muted-foreground">
            MEHKO complaint management &amp; LEA reporting
          </p>
        </div>
        {counts.pending > 0 && (
          <Badge variant="destructive">
            {counts.pending} pending
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", "pending", "reviewed", "lea"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter === f ? "bg-homeplate-orange hover:bg-homeplate-orange-dark" : ""}
          >
            <Filter className="mr-1 h-3 w-3" />
            {f === "all"
              ? `All (${counts.all})`
              : f === "pending"
              ? `Pending (${counts.pending})`
              : f === "reviewed"
              ? `Reviewed (${counts.reviewed})`
              : `LEA Reported (${counts.lea})`}
          </Button>
        ))}
      </div>

      {/* Complaint list */}
      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-green-300" />
              <p className="mt-3 text-sm text-muted-foreground">
                No complaints in this category.
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((c) => (
            <Card
              key={c.id}
              className={
                !c.adminReviewed
                  ? "border-l-4 border-l-red-400"
                  : c.reportedToLea
                  ? "border-l-4 border-l-orange-400"
                  : ""
              }
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{c.cookName}</span>
                      <span className="text-xs text-muted-foreground">
                        reported by {c.customerName}
                      </span>
                      {c.reportedToLea && (
                        <Badge
                          variant="destructive"
                          className="text-xs"
                        >
                          <FileWarning className="mr-1 h-3 w-3" />
                          LEA
                        </Badge>
                      )}
                      {c.adminReviewed && !c.reportedToLea && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Reviewed
                        </Badge>
                      )}
                      {!c.adminReviewed && (
                        <Badge
                          variant="outline"
                          className="border-red-200 bg-red-50 text-xs text-red-700"
                        >
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-700">
                      {c.description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.submittedAt
                        ? new Date(c.submittedAt).toLocaleString()
                        : ""}
                      {c.leaReportDate &&
                        ` • LEA reported: ${new Date(
                          c.leaReportDate
                        ).toLocaleDateString()}`}
                    </p>
                  </div>
                  {!c.adminReviewed && (
                    <div className="flex flex-shrink-0 flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkReviewed(c.id)}
                        disabled={loadingId === c.id}
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Reviewed
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReportToLea(c.id)}
                        disabled={loadingId === c.id}
                      >
                        <FileWarning className="mr-1 h-3 w-3" />
                        Report LEA
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
