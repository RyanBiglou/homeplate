"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APPROVED_COUNTIES } from "@/lib/counties";

interface MapFiltersProps {
  county: string;
  cuisine: string;
  fulfillmentType: string;
  onCountyChange: (value: string) => void;
  onCuisineChange: (value: string) => void;
  onFulfillmentChange: (value: string) => void;
}

const CUISINE_OPTIONS = [
  "All Cuisines",
  "Mexican",
  "Indian",
  "Chinese",
  "Italian",
  "Thai",
  "Japanese",
  "Ethiopian",
  "Filipino",
  "Vietnamese",
  "Korean",
  "Mediterranean",
  "Soul Food",
  "Caribbean",
  "American",
];

const FULFILLMENT_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "pickup", label: "Pickup" },
  { value: "dine_in", label: "Dine In" },
  { value: "delivery", label: "Cook Delivery" },
];

export function MapFilters({
  county,
  cuisine,
  fulfillmentType,
  onCountyChange,
  onCuisineChange,
  onFulfillmentChange,
}: MapFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select value={county} onValueChange={onCountyChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Counties" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Counties</SelectItem>
          {APPROVED_COUNTIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={cuisine} onValueChange={onCuisineChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Cuisines" />
        </SelectTrigger>
        <SelectContent>
          {CUISINE_OPTIONS.map((c) => (
            <SelectItem key={c} value={c === "All Cuisines" ? "all" : c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={fulfillmentType} onValueChange={onFulfillmentChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Fulfillment" />
        </SelectTrigger>
        <SelectContent>
          {FULFILLMENT_OPTIONS.map((f) => (
            <SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
