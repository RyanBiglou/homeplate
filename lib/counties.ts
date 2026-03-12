export const APPROVED_COUNTIES = [
  "Riverside",
  "Alameda",
  "Solano",
  "San Mateo",
  "San Diego",
  "Santa Clara",
  "Amador",
  "San Benito",
  "Monterey",
  "Sierra",
  "Contra Costa",
  "Los Angeles",
  "Santa Cruz",
  "Sonoma",
  "Berkeley (City)",
  "Plumas",
  "San Luis Obispo",
  "Ventura",
] as const;

export type ApprovedCounty = (typeof APPROVED_COUNTIES)[number];

export function isApprovedCounty(county: string): county is ApprovedCounty {
  return APPROVED_COUNTIES.includes(county as ApprovedCounty);
}
