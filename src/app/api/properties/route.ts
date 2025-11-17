import { NextResponse } from "next/server";
import { PropertyListing } from "@/data/property-listing";

let projects = PropertyListing.projects;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") || "").toLowerCase();

  console.log("Received search params:", Array.from(searchParams.entries()));
  const minBudget = Number(searchParams.get("minBudget") || 0);
  const maxBudget = Number(searchParams.get("maxBudget") || Infinity);

  const sortType = searchParams.get("sortType") || "popularity";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const currentPage = Number(searchParams.get("page") || 1);
  const pageSize = 10;

  let matches: any[] = [];

  if (query) {
    for (const p of projects) {
      const name = p.name.toLowerCase();
      const dev = p.developerName.toLowerCase();
      const micro = p.micromarket.toLowerCase();

      if (
        name.startsWith(query) ||
        dev.startsWith(query) ||
        micro.startsWith(query)
      ) {
        // matches.push({
        //   label: p.name,
        //   developer: p.developerName,
        //   micromarket: p.micromarket,
        //   fullItem: p,
        // });
        matches.push(p);
      }
    }
  } else {
    console.log("No query provided, returning all projects.");
    matches = projects;
  }

  console.log(matches.length, "matches found before filtering.");
  console.log("budget filter:", minBudget, "-", maxBudget);

  matches = matches.filter(
    (p) => p.minPrice >= minBudget && p.maxPrice <= maxBudget
  );

  console.log(matches.length, "matches found after budget filtering.");

  matches.sort((a, b) => {
    let valueA, valueB;

    switch (sortType) {
      case "price":
        valueA = a.minPrice;
        valueB = b.minPrice;
        break;

      case "possession":
        valueA = new Date(a.possessionDate).getTime();
        valueB = new Date(b.possessionDate).getTime();
        break;

      default: 
        valueA = a.propscore;
        valueB = b.propscore;
    }

    return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
  });

  console.log(matches.length, "matches found after sorting.");

  const totalMatches = matches.length;

  console.log(totalMatches, "total matches found for query:", query);
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
