import Search from "./_components/Search";

import PropertyView from "./_components/PropertyView";

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

  const query =
    params?.search ||
    params?.name ||
    params?.developerName ||
    params?.micromarket ||
    "";

  const currentPageValue = Number(params?.page || 1);

  return (
    <div className="w-full max-w-full min-h-screen flex flex-col bg-white pt-5 overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex flex-row">
        <Search placeholder="Search for Developers, Locations, or Projects" />
      </div>

      <PropertyView query={query} currentPage={currentPageValue} />
    </div>
  );
}
