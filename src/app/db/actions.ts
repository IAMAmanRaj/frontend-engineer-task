import { PropertyListing } from "@/data/property-listing";

const projects = PropertyListing.projects;

export async function getTotalPages(
  query: string,
  filters: {
    minBudget: number;
    maxBudget: number;
  }
): Promise<number> {
  const pageSize = 10;

  let matches = [...projects];

  if (query) {
    const lower = query.toLowerCase();

    matches = matches.filter((p) => {
      const name = p.name.toLowerCase();
      const dev = p.developerName.toLowerCase();
      const micro = p.micromarket.toLowerCase();

      return (
        name.startsWith(lower) ||
        dev.startsWith(lower) ||
        micro.startsWith(lower)
      );
    });
  }

  matches = matches.filter(
    (p) => p.minPrice >= filters.minBudget && p.maxPrice <= filters.maxBudget
  );

  return Math.ceil(matches.length / pageSize);
}
