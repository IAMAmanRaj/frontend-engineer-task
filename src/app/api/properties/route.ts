import { NextResponse } from "next/server";
import { PropertyListing } from "@/data/property-listing";

let projects = PropertyListing.projects;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") || "").toLowerCase();


  const minBudget = Number(searchParams.get("minBudget") || 0);
  const maxBudget = Number(searchParams.get("maxBudget") || Infinity);

  const sortType = searchParams.get("sortType") || "popularity";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const apartmentsParam = searchParams.get("apartments");
  const villasParam = searchParams.get("villas");
  const plotAreaParam = searchParams.get("plotArea");

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
        matches.push(p);
      }
    }
  } else {

    matches = projects;
  }

  matches = matches.filter(
    (p) => p.minPrice >= minBudget && p.maxPrice <= maxBudget
  );


  if (apartmentsParam || villasParam || plotAreaParam) {
    matches = matches.filter((p) => {
      const propertyType = p.type.toLowerCase();

      if (apartmentsParam) {
        const selectedBHKs = apartmentsParam.split("+").map(Number);

        if (
          propertyType.includes("apartment") ||
          propertyType.includes("flat")
        ) {
          const hasMatchingBHK = p.typologies.some((typology: string) => {
            const bhkMatch = typology.match(/(\d+)\s*BHK/i);
            if (bhkMatch) {
              const bhkValue = Number(bhkMatch[1]);
              return selectedBHKs.includes(bhkValue);
            }
            return false;
          });

          if (hasMatchingBHK) return true;
        }
      }

      if (villasParam) {
        const selectedBHKs = villasParam.split("+").map(Number);

        if (propertyType.includes("villa")) {
          const hasMatchingBHK = p.typologies.some((typology: string) => {
            const bhkMatch = typology.match(/(\d+)\s*BHK/i);
            if (bhkMatch) {
              const bhkValue = Number(bhkMatch[1]);
              return selectedBHKs.includes(bhkValue);
            }
            return false;
          });

          if (hasMatchingBHK) return true;
        }
      }

      if (plotAreaParam) {
        const minPlotArea = Number(plotAreaParam);

        if (
          propertyType.includes("plot") ||
          propertyType.includes("row house") ||
          propertyType === "land"
        ) {
          if (p.minSaleableArea >= minPlotArea) {
            return true;
          }
        }
      }

      return false;
    });

  }

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

      default: // popularity
        valueA = a.propscore;
        valueB = b.propscore;
    }

    return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
  });

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
