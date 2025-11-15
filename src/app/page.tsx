import { PropertyListing } from "@/data/property-listing";
import MapCaller from "@/components/MapCaller";
import Search from "./_components/Search";

import PropertyList from "./_components/PropertyList";

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
    name?: string;
    developerName?: string;
    micromarket?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query =
    searchParams?.name ||
    searchParams?.developerName ||
    searchParams?.micromarket ||
    "";
  const currentPage = Number(1);

  return (
    <div className="w-screen h-screen flex flex-col bg-white pt-5">
      <div className="flex flex-row">
        <Search placeholder="Search for Developers, Locations, or Projects" />
      </div>
      <PropertyList query={query} currentPage={currentPage} />

      {/* <MapCaller allFilteredData={PropertyListing} /> */}
    </div>
  );
}
