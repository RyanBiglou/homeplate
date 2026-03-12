"use client";

interface CookMarkerProps {
  cookId: string;
  cuisineType?: string;
  onClick?: () => void;
}

export function CookMarker({ cookId, cuisineType, onClick }: CookMarkerProps) {
  return (
    <button
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-homeplate-orange text-white shadow-lg transition-transform hover:scale-110"
      title={`Cook ${cookId}`}
    >
      {cuisineType ? cuisineType[0].toUpperCase() : "🍽️"}
    </button>
  );
}
