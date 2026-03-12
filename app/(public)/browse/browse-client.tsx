"use client";

import { useState, useMemo } from "react";
import { CookCard } from "@/components/cook/CookCard";
import { MapFilters } from "@/components/map/MapFilters";
import { CookMap } from "@/components/map/CookMap";
import { Input } from "@/components/ui/input";
import { Search, MapPin, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BrowseCook {
  id: string;
  userId: string | null;
  name: string;
  bio: string | null;
  cuisineTypes: string[];
  county: string;
  permitNumber: string;
  profilePhotoUrl: string | null;
  lat: number | null;
  lng: number | null;
  permitVerified: boolean;
}

interface BrowseClientProps {
  initialCooks: BrowseCook[];
}

export function BrowseClient({ initialCooks }: BrowseClientProps) {
  const [county, setCounty] = useState("all");
  const [cuisine, setCuisine] = useState("all");
  const [fulfillmentType, setFulfillmentType] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"map" | "list">("list");
  const [selectedCookId, setSelectedCookId] = useState<string | null>(null);

  const filteredCooks = useMemo(() => {
    let result = initialCooks;

    if (county !== "all") {
      result = result.filter((c) => c.county === county);
    }
    if (cuisine !== "all") {
      result = result.filter((c) =>
        c.cuisineTypes.some(
          (ct) => ct.toLowerCase() === cuisine.toLowerCase()
        )
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.bio?.toLowerCase().includes(q) ||
          c.cuisineTypes.some((ct) => ct.toLowerCase().includes(q)) ||
          c.county.toLowerCase().includes(q)
      );
    }

    return result;
  }, [initialCooks, county, cuisine, search]);

  const cooksWithCoords = filteredCooks.filter(
    (c) => c.lat !== null && c.lng !== null
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-homeplate-dark">
            Find Home Cooks Near You
          </h1>
          <p className="mt-1 text-gray-600">
            {filteredCooks.length} MEHKO-permitted cook
            {filteredCooks.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            <List className="mr-1 h-4 w-4" />
            List
          </Button>
          <Button
            variant={view === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("map")}
          >
            <MapPin className="mr-1 h-4 w-4" />
            Map
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mt-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, cuisine, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <MapFilters
          county={county}
          cuisine={cuisine}
          fulfillmentType={fulfillmentType}
          onCountyChange={setCounty}
          onCuisineChange={setCuisine}
          onFulfillmentChange={setFulfillmentType}
        />
      </div>

      {view === "map" ? (
        /* Map + Side List */
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="h-[500px] overflow-hidden rounded-lg border lg:h-[600px]">
            <CookMap
              cooks={cooksWithCoords.map((c) => ({
                id: c.id,
                lat: c.lat,
                lng: c.lng,
                permit_number: c.permitNumber,
                name: c.name,
                cuisineTypes: c.cuisineTypes,
              }))}
              onCookSelect={setSelectedCookId}
              selectedCookId={selectedCookId}
            />
          </div>
          <div className="max-h-[600px] space-y-4 overflow-y-auto">
            {filteredCooks.length === 0 ? (
              <EmptyState />
            ) : (
              filteredCooks.map((cook) => (
                <div
                  key={cook.id}
                  className={
                    selectedCookId === cook.id
                      ? "rounded-lg ring-2 ring-homeplate-orange"
                      : ""
                  }
                >
                  <CookCard
                    id={cook.id}
                    name={cook.name}
                    bio={cook.bio}
                    cuisineTypes={cook.cuisineTypes}
                    county={cook.county}
                    permitNumber={cook.permitNumber}
                    profilePhotoUrl={cook.profilePhotoUrl}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="mt-6">
          {filteredCooks.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCooks.map((cook) => (
                <CookCard
                  key={cook.id}
                  id={cook.id}
                  name={cook.name}
                  bio={cook.bio}
                  cuisineTypes={cook.cuisineTypes}
                  county={cook.county}
                  permitNumber={cook.permitNumber}
                  profilePhotoUrl={cook.profilePhotoUrl}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-homeplate-cream">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-homeplate-dark">
        No cooks found
      </h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        Try adjusting your filters or search terms. New cooks join HomePlate
        every day!
      </p>
    </div>
  );
}
