import { NextResponse } from "next/server";
import { PropertyListing } from "@/data/property-listing";

let projects = PropertyListing.projects;

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() || "";

  if (!q) return NextResponse.json({ suggestions: [] });

  const nameMatchesStarts = [];
  const nameMatchesIncludes = [];
  const developerMatchesStarts = [];
  const developerMatchesIncludes = [];
  const microMatchesStarts = [];
  const microMatchesIncludes = [];

  const uniqueNames = new Set();
  const uniqueDevelopers = new Set();
  const uniqueMicros = new Set();

  const namesMatched = new Set();
  const devsMatched = new Set();
  const microsMatched = new Set();

  for (const p of projects) {
    const name = p.name.toLowerCase();
    const dev = p.developerName.toLowerCase();
    const micro = p.micromarket.toLowerCase();

    if (!uniqueNames.has(p.name)) {
      if (name.startsWith(q)) {
        uniqueNames.add(p.name);
        namesMatched.add(p.name);
        nameMatchesStarts.push({
          label: p.name,
          type: "name",
          fullItem: p,
        });
      }
    }

    if (!uniqueNames.has(p.name) && !namesMatched.has(p.name)) {
      if (name.includes(q)) {
        uniqueNames.add(p.name);
        nameMatchesIncludes.push({
          label: p.name,
          type: "name",
          fullItem: p,
        });
      }
    }

    if (!uniqueDevelopers.has(p.developerName)) {
      if (dev.startsWith(q)) {
        uniqueDevelopers.add(p.developerName);
        devsMatched.add(p.developerName);
        developerMatchesStarts.push({
          label: p.developerName,
          type: "developerName",
          fullItem: p,
        });
      }
    }
    if (
      !uniqueDevelopers.has(p.developerName) &&
      !devsMatched.has(p.developerName)
    ) {
      if (dev.includes(q)) {
        uniqueDevelopers.add(p.developerName);
        developerMatchesIncludes.push({
          label: p.developerName,
          type: "developerName",
          fullItem: p,
        });
      }
    }

    if (!uniqueMicros.has(p.micromarket)) {
      if (micro.startsWith(q)) {
        uniqueMicros.add(p.micromarket);
        microsMatched.add(p.micromarket);
        microMatchesStarts.push({
          label: p.micromarket,
          type: "micromarket",
          fullItem: p,
        });
      }
    }
    if (!uniqueMicros.has(p.micromarket) && !microsMatched.has(p.micromarket)) {
      if (micro.includes(q)) {
        uniqueMicros.add(p.micromarket);
        microMatchesIncludes.push({
          label: p.micromarket,
          type: "micromarket",
          fullItem: p,
        });
      }
    }
  }

  const developerMatches = [
    ...developerMatchesStarts,
    ...developerMatchesIncludes,
  ];
  const microMatches = [...microMatchesStarts, ...microMatchesIncludes];
  const nameMatches = [...nameMatchesStarts, ...nameMatchesIncludes];

  return NextResponse.json({
    suggestions: [...developerMatches, ...microMatches, ...nameMatches],
  });
}
