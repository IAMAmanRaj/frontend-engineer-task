import { PropertyListing } from "@/data/property-listing";
import MapCaller from "@/components/MapCaller";
import Search from "./_components/Search";

import PropertyList from "./_components/PropertyList";
import { PaginationComponent } from "./_components/Pagination";
import { getTotalPages } from "./db/actions";

//TODO : Add meta data for this page
// Page should serve via SSR
// Do not add "use client" declarative

// TODO: Create a List view for these properties.
// Use your own imagination while designing, please don't copy Propsoch's current UI.
// We don't like it either.
// Add pagination
// You can modify the Property Listing however you want. If you feel like creating an API and implementing pagination via that, totally your call.

export default async function Page(props: {
  searchParams?: Promise<{
    search?: string;
    name?: string;
    developerName?: string;
    micromarket?: string;
    page?: string;
    minBudget?: string;
    maxBudget?: string;
    sortType?: string;
    sortOrder?: string;
    possession?: string;
  }>;
}) {
  const params = await props.searchParams;

  const DEFAULTS = {
    minBudget: "5000000",
    maxBudget: "30000000",
    sortType: "popularity",
    sortOrder: "desc",
    possession: "any",
    page: "1",
  };

  const getParam = (key: keyof typeof DEFAULTS) =>
    params?.[key] ?? DEFAULTS[key];

  const query =
    params?.search ||
    params?.name ||
    params?.developerName ||
    params?.micromarket ||
    "";

  const currentPageValue = Number(params?.page || 1);

  const filters = {
    minBudget: Number(getParam("minBudget")),
    maxBudget: Number(getParam("maxBudget")),
  };

  const totalPages = await getTotalPages(query, filters);

  return (
    <div className="w-screen h-screen flex flex-col bg-white pt-5">
      <div className="flex flex-row">
        <Search placeholder="Search for Developers, Locations, or Projects" />
      </div>

      <PropertyList query={query} currentPage={currentPageValue} />

      <PaginationComponent pageCount={totalPages} />

      {/* <MapCaller allFilteredData={PropertyListing} /> */}
    </div>
  );
}
