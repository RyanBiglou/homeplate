import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, MapPin } from "lucide-react";

interface CookProfileProps {
  name: string;
  bio: string | null;
  cuisineTypes: string[];
  county: string | null;
  permitNumber: string;
  profilePhotoUrl: string | null;
  permitVerified: boolean;
}

export function CookProfile({
  name,
  bio,
  cuisineTypes,
  county,
  permitNumber,
  profilePhotoUrl,
  permitVerified,
}: CookProfileProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Avatar className="h-24 w-24">
          {profilePhotoUrl ? (
            <img src={profilePhotoUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <AvatarFallback className="bg-homeplate-cream text-3xl">
              🍳
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-homeplate-dark">{name}</h1>
          {bio && <p className="mt-2 text-gray-600">{bio}</p>}
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-green-300 bg-green-50 text-green-700"
            >
              <Shield className="h-3 w-3" />
              Permit: {permitNumber}
              {permitVerified && " ✓"}
            </Badge>
            {county && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {county}
              </Badge>
            )}
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-1 sm:justify-start">
            {cuisineTypes.map((cuisine) => (
              <Badge key={cuisine} variant="secondary" className="text-xs">
                {cuisine}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-sm italic text-homeplate-muted">
            Made in a Home Kitchen
          </p>
        </div>
      </div>
    </div>
  );
}
