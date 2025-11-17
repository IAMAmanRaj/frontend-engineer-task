import Search from "./_components/Search";

import PropertyView from "./_components/PropertyView";

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { DEFAULTS } from "./constants";

export async function generateMetadata(props: {
  searchParams: Promise<{
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
}): Promise<Metadata> {
  const searchParams = await props.searchParams;

  const query =
    searchParams.search ||
    searchParams.name ||
    searchParams.developerName ||
    searchParams.micromarket ||
    "";

  const title = query
    ? `Properties matching "${query}" - Propsoch`
    : "Propsoch - Your guided home buying program";

  const description = query
    ? `Explore properties matching "${query}" with Propsoch. Find your perfect home from verified listings.`
    : "Propsoch offers a guided home buying experience with verified property listings. Start your property search today. Whether you're looking for apartments, villas, or plots, we've got you covered.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "https://www.propsoch.com/",
      siteName: "Propsoch",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@propsoch",
    },
  };
}

//TODO : Add meta data for this page
// Page should serve via SSR
// Do not add "use client" declarative
//POST FIX : Added the meta data function above. I'm using the dynamic query params to set the title and description accordingly.

// TODO: Create a List view for these properties.
// Use your own imagination while designing, please don't copy Propsoch's current UI.
// We don't like it either.
// Add pagination
// You can modify the Property Listing however you want. If you feel like creating an API and implementing pagination via that, totally your call.

//POST FIX : Added by defining a Pagination component and integrating it with PropertyView. The pagination logic is handled in the Pagination component, while PropertyView fetches the data using SWR and displays the properties based on the current page.

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
  const hasParams = params && Object.keys(params).length > 0;

  if (!hasParams) {
    // Build default URL with params
    const defaultParams = new URLSearchParams({
      minBudget: DEFAULTS.minBudget,
      maxBudget: DEFAULTS.maxBudget,
      sortType: DEFAULTS.sortType,
      sortOrder: DEFAULTS.sortOrder,
      possession: DEFAULTS.possession,
      page: DEFAULTS.page,
    });

    redirect(`/?${defaultParams.toString()}`);
  }
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
