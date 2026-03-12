import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Shield } from "lucide-react";

interface CookCardProps {
  id: string;
  name: string;
  bio: string | null;
  cuisineTypes: string[];
  county: string | null;
  permitNumber: string;
  profilePhotoUrl: string | null;
}

export function CookCard({
  id,
  name,
  bio,
  cuisineTypes,
  county,
  permitNumber,
  profilePhotoUrl,
}: CookCardProps) {
  return (
    <Link href={`/cooks/${id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="flex gap-4 p-4">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-homeplate-cream">
            {profilePhotoUrl ? (
              <img
                src={profilePhotoUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl">
                🍳
              </div>
            )}
          </div>
          <CardContent className="flex-1 p-0">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-homeplate-dark">{name}</h3>
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-green-300 bg-green-50 text-xs text-green-700"
              >
                <Shield className="h-3 w-3" />
                {permitNumber}
              </Badge>
            </div>
            {bio && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{bio}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {cuisineTypes.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant="secondary"
                  className="text-xs"
                >
                  {cuisine}
                </Badge>
              ))}
            </div>
            {county && (
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                {county} County
              </div>
            )}
            <p className="mt-1 text-xs italic text-homeplate-muted">
              Made in a Home Kitchen
            </p>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
