import { NextResponse } from "next/server";
import { PropertyListing } from "@/data/property-listing";

let projects = PropertyListing.projects;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") || "").toLowerCase();
  const currentPage = Number(searchParams.get("page") || 1);
  const pageSize = 10;

  if (!query) return NextResponse.json({ results: [] });

  const matches: any[] = [];

  for (const p of projects) {
    const name = p.name.toLowerCase();
    const dev = p.developerName.toLowerCase();
    const micro = p.micromarket.toLowerCase();

    if (
      name.startsWith(query) ||
      dev.startsWith(query) ||
      micro.startsWith(query)
    ) {
      matches.push({
        label: p.name,
        developer: p.developerName,
        micromarket: p.micromarket,
        fullItem: p,
      });
    }
  }

  const totalMatches = matches.length;
  const totalPages = Math.ceil(totalMatches / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedResults = matches.slice(startIndex, endIndex);

  return NextResponse.json({
    query,
    currentPage,
    totalMatches,
    totalPages,
    results: paginatedResults,
  });
}
