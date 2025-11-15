import { NextResponse } from "next/server";
import { PropertyListing } from "@/data/property-listing";

let projects = PropertyListing.projects;

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() || "";

  if (!q) return NextResponse.json({ suggestions: [] });

  const nameMatches: any[] = [];
  const developerMatches: any[] = [];
  const microMatches: any[] = [];

  const uniqueNames = new Set<string>();
  const uniqueDevelopers = new Set<string>();
  const uniqueMicros = new Set<string>();

  for (const p of projects) {
    const name = p.name.toLowerCase();
    const dev = p.developerName.toLowerCase();
    const micro = p.micromarket.toLowerCase();

    if (name.startsWith(q) && !uniqueNames.has(p.name)) {
      uniqueNames.add(p.name);
      nameMatches.push({
        label: p.name,
        type: "name",
        fullItem: p,
      });
    }

    if (dev.startsWith(q) && !uniqueDevelopers.has(p.developerName)) {
      uniqueDevelopers.add(p.developerName);
      developerMatches.push({
        label: p.developerName,
        type: "developerName",
        fullItem: p,
      });
    }

    if (micro.startsWith(q) && !uniqueMicros.has(p.micromarket)) {
      uniqueMicros.add(p.micromarket);
      microMatches.push({
        label: p.micromarket,
        type: "micromarket",
        fullItem: p,
      });
    }
  }

  return NextResponse.json({
    suggestions: [...nameMatches, ...developerMatches, ...microMatches],
  });
}

