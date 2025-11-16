import { PropertyListing } from "@/data/property-listing";

const projects = PropertyListing.projects;

export async function getTotalPages(query: string): Promise<number> {
  let maxPages = Math.ceil(projects.length / 10);
  if (!query) return maxPages;

  const lowerQuery = query.toLowerCase();

  let matchesCount = 0;
  for (const p of projects) {
    const name = p.name.toLowerCase();
    const dev = p.developerName.toLowerCase();
    const micro = p.micromarket.toLowerCase();

    if (
      name.startsWith(lowerQuery) ||
      dev.startsWith(lowerQuery) ||
      micro.startsWith(lowerQuery)
    ) {
      matchesCount++;
    }
  }

  const totalPages = Math.ceil(matchesCount / 10);
  return totalPages;
}
