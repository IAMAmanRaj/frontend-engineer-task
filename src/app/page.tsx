import { PropertyListing } from "@/data/property-listing";
import MapCaller from "@/components/MapCaller";

//TODO : Add meta data for this page
// Page should serve via SSR
// Do not add "use client" declarative

// TODO: Create a List view for these properties.
// Use your own imagination while designing, please don't copy Propsoch's current UI.
// We don't like it either.
// Add pagination
// You can modify the Property Listing however you want. If you feel like creating an API and implementing pagination via that, totally your call.

export default async function Page() {
  return (
    <div className="w-screen h-screen">
      <MapCaller allFilteredData={PropertyListing} />
    </div>
  );
}
