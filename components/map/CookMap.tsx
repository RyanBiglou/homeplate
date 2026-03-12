"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

interface CookMapCook {
  id: string;
  lat: number | null;
  lng: number | null;
  permit_number: string;
  name?: string;
  cuisineTypes?: string[];
}

interface CookMapProps {
  cooks: CookMapCook[];
  onBoundsChange?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  onCookSelect?: (cookId: string) => void;
  selectedCookId?: string | null;
}

export function CookMap({
  cooks,
  onCookSelect,
  selectedCookId,
}: CookMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

  const initMap = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapRef.current) {
      setApiAvailable(false);
      return;
    }

    try {
      const { Loader } = await import("@googlemaps/js-api-loader");
      const loader = new Loader({
        apiKey,
        version: "weekly",
      });

      const loaderAny = loader as unknown as { importLibrary: (lib: string) => Promise<void> };
      await loaderAny.importLibrary("maps");
      await loaderAny.importLibrary("marker");

      const center =
        cooks.length > 0 && cooks[0].lat && cooks[0].lng
          ? { lat: cooks[0].lat, lng: cooks[0].lng }
          : { lat: 34.0522, lng: -118.2437 };

      const map = new google.maps.Map(mapRef.current!, {
        center,
        zoom: 11,
        mapId: "homeplate-browse",
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
      });

      googleMapRef.current = map;
      setApiAvailable(true);
      setMapLoaded(true);
    } catch {
      setApiAvailable(false);
    }
  }, [cooks]);

  useEffect(() => {
    initMap();
  }, [initMap]);

  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    for (const marker of markersRef.current) {
      marker.map = null;
    }
    markersRef.current = [];

    for (const cook of cooks) {
      if (cook.lat == null || cook.lng == null) continue;

      const pin = document.createElement("div");
      pin.className = `flex items-center justify-center w-8 h-8 rounded-full shadow-lg cursor-pointer transition-transform ${
        selectedCookId === cook.id
          ? "bg-homeplate-dark scale-125"
          : "bg-homeplate-orange hover:scale-110"
      }`;
      pin.innerHTML = `<span class="text-white text-xs font-bold">${
        cook.cuisineTypes?.[0]?.[0]?.toUpperCase() ?? "🍽"
      }</span>`;
      pin.addEventListener("click", () => onCookSelect?.(cook.id));

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: googleMapRef.current,
        position: { lat: cook.lat, lng: cook.lng },
        content: pin,
        title: cook.name ?? cook.permit_number,
      });

      markersRef.current.push(marker);
    }
  }, [cooks, mapLoaded, selectedCookId, onCookSelect]);

  if (apiAvailable === false) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-gradient-to-br from-homeplate-cream to-orange-50 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-homeplate-orange/10">
          <MapPin className="h-8 w-8 text-homeplate-orange" />
        </div>
        <p className="mt-4 text-center text-sm font-medium text-homeplate-dark">
          Map View
        </p>
        <p className="mt-1 text-center text-xs text-gray-500">
          {cooks.length} cook{cooks.length !== 1 ? "s" : ""} in your area
        </p>
        <div className="mt-4 grid max-w-md grid-cols-2 gap-2">
          {cooks.slice(0, 6).map((cook) => (
            <button
              key={cook.id}
              onClick={() => onCookSelect?.(cook.id)}
              className={`rounded-lg border p-2 text-left text-xs transition-colors ${
                selectedCookId === cook.id
                  ? "border-homeplate-orange bg-white"
                  : "border-transparent bg-white/60 hover:bg-white"
              }`}
            >
              <span className="font-medium">{cook.name ?? "Cook"}</span>
              {cook.cuisineTypes && cook.cuisineTypes.length > 0 && (
                <span className="block text-gray-400">
                  {cook.cuisineTypes[0]}
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400">
          Add GOOGLE_MAPS_API_KEY for full map
        </p>
      </div>
    );
  }

  if (!mapLoaded) {
    return <Skeleton className="h-full w-full rounded-lg" />;
  }

  return <div ref={mapRef} className="h-full w-full rounded-lg" />;
}
