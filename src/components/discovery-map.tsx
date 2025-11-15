"use client";

// TODO:  When zooming out, property nodes overlap and become cluttered.
// Improve visual spacing for a better UI/UX.

import "leaflet/dist/leaflet.css";

// TODO : This import gives "window is not defined" error in the terminal. Fix it.
// POST FIX : use next/dynamic in a client side component that takes the incoming data from server as prop and passes it to child -> discovery-map.tsx component. This ensures, the discover-map.tsx component renders on client side in the browser and the window object by that time is accessible to the dependency.
import "leaflet-defaulticon-compatibility";

// TODO : Clicking a marker should ideally open the popup with the selected property details. Currently not implemented. Implement it.
// POST FIX : The addition of eventHandlers prop along with the defined action over onClick event as to set the selected property and location opens up the popUp with the required data in the popup component.

import { JSX, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import { PropscoreRating } from "@/assets/PropsochRating";
import {
  cn,
  concatenateTypologies,
  formatDate,
  formatPrice,
  para,
} from "@/utils/helpers";
import { BudgetIcon } from "@/assets/budget-icon";
import { HouseIcon } from "@/assets/house-icon";
import { LocationIcon } from "@/assets/location-icon";
import { CalendarIcon } from "@/assets/utility";
import L, { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { Location, projectListing } from "@/types/types";
import { Badge } from "./badge";
import { renderToString } from "react-dom/server";


export const renderIcon = (
  icon: JSX.Element,
  ariaLabel: string,
  transform = "translate(-8px, -4px)"
) =>
  `<div style="transform: ${transform}" aria-label="${ariaLabel}" role="button">${renderToString(
    icon
  )}</div>`;

function getOtherLocationIcon(
  label: string,
  isSelected: boolean,
  icon = true
): L.DivIcon {
  return L.divIcon({
    html: renderIcon(
      <Badge variant={"white"} className="w-max whitespace-nowrap">
        {label}
      </Badge>,
      label,
      isSelected ? "translate(-10px, -20px)" : "translate(-15px, -20px)"
    ),
  });
}

function MapClickHandler({ onClick }: { onClick: () => void }) {
  useMapEvents({
    click: () => onClick(),
  });
  return null;
}

function MapController({
  selectedLocation,
}: Readonly<{
  selectedLocation: Location | null;
}>) {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      map.panTo([selectedLocation.lat, selectedLocation.lon], {
        animate: true,
        duration: 1.5,
      });
    }
  }, [selectedLocation, map]);

  return null;
}

export default function DiscoveryMap({
  allFilteredData,
}: Readonly<{ allFilteredData: any }>) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const sectionRef = useRef(null);
  const [selectedProperty, setSelectedProperty] =
    useState<projectListing | null>(null);

  useEffect(() => {
    if (selectedLocation) {
      const found = allFilteredData.projects.find(
        (prop: projectListing) => prop.name == selectedLocation.name
      );
      setSelectedProperty(found);
      const el = document.querySelector(
        `[data-marker-id="${selectedLocation.name}"]`
      ) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedLocation]);

  return (
    <section
      ref={sectionRef}
      style={{ fontFamily: "Arial, sans-serif" }}
      className="flex aspect-auto h-full flex-col gap-4 overflow-hidden"
      aria-label={`Project discovery via map`}
    >
      {/* Map Container */}
      <div className="relative size-full overflow-hidden">
        <MapContainer
          center={[12.97, 77.59]}
          zoom={12}
          scrollWheelZoom={true}
          dragging={true}
          touchZoom={true}
          className="border-lightborder z-10 size-full rounded-lg border object-cover"
          aria-label="Map view"
        >
          <LayersControl position="bottomleft">
            {/* Street View */}
            <LayersControl.BaseLayer checked name="Street View">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>

            {/* Satellite View (Esri) */}
            <LayersControl.BaseLayer name="Satellite View">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          <MapClickHandler onClick={() => setSelectedLocation(null)} />
          <MapController selectedLocation={selectedLocation} />

          {/* Project Location Marker */}

          {allFilteredData && allFilteredData.projects.length > 0
            ? allFilteredData.projects.map((project: projectListing) => (
                <Marker
                  eventHandlers={{
                    click: () => {
                      setSelectedProperty(project);
                      setSelectedLocation({
                        name: project.name,
                        lat: project.latitude,
                        lon: project.longitude,
                      });
                    },
                  }}
                  position={[project.latitude, project.longitude]}
                  key={project.id}
                  icon={getOtherLocationIcon(
                    project.name,
                    selectedProperty?.id == project.id
                  )}
                />
              ))
            : null}
          {selectedLocation && selectedProperty && (
            <Popup
              position={[selectedLocation.lat, selectedLocation.lon]}
              autoClose={false}
              closeOnClick={false}
              offset={[0, -20]}
              closeOnEscapeKey
              minWidth={400}
              closeButton
            >
              <Link
                href={`/property-for-sale-in/${selectedProperty.city.toLowerCase()}/${selectedProperty.slug.toLowerCase()}/${
                  selectedProperty.id
                }`}
                target="_blank"
              >
                <div className="flex w-full flex-col gap-3">
                  <Image
                    src={selectedProperty.image}
                    alt={selectedProperty.alt}
                    width={500}
                    height={500}
                    loading="lazy"
                    className={cn(
                      "aspect-video size-full rounded-lg object-cover transition-all duration-400 ease-in-out",
                      selectedProperty.projectStatus === "soldOut" &&
                        "grayscale"
                    )}
                  />
                  <h3
                    className={cn(
                      para({ size: "lg", color: "dark" }),
                      "font-semibold"
                    )}
                  >
                    {selectedProperty.name}
                  </h3>

                  <div className="flex flex-col gap-3 whitespace-nowrap">
                    <div className="flex w-full items-center justify-between">
                      <span
                        className={cn(
                          para({ color: "dark", size: "sm" }),
                          "flex w-full items-center gap-2"
                        )}
                      >
                        <LocationIcon width={20} height={20} />
                        <span>{selectedProperty.micromarket}</span>
                      </span>
                      <span
                        className={cn(
                          para({ color: "dark", size: "sm" }),
                          "flex w-full items-center justify-end gap-2"
                        )}
                      >
                        <PropscoreRating
                          rating={selectedProperty.propscore}
                          width={110}
                          height={24}
                          className={"ml-auto w-max max-w-40"}
                        />
                      </span>
                    </div>
                    <div className="flex w-full items-center justify-between gap-3">
                      <span
                        className={cn(
                          para({ color: "dark", size: "sm" }),
                          "flex w-full max-w-40 items-center gap-2 truncate"
                        )}
                      >
                        <BudgetIcon width={20} height={20} />
                        {formatPrice(selectedProperty.minPrice, false)} -{" "}
                        {formatPrice(selectedProperty.maxPrice, false)}
                      </span>
                      <span
                        className={cn(
                          para({ color: "dark", size: "sm" }),
                          "flex w-full items-center justify-end gap-2"
                        )}
                      >
                        <CalendarIcon height={20} width={20} />
                        {formatDate(selectedProperty.possessionDate)}
                      </span>
                    </div>
                    <div className="flex w-full items-center justify-between gap-3">
                      <span
                        className={cn(
                          para({ color: "dark", size: "sm" }),
                          "flex w-full max-w-40 items-center gap-2 truncate"
                        )}
                      >
                        <HouseIcon width={20} height={20} />
                        <span className="w-32 max-w-32 truncate">
                          {concatenateTypologies(selectedProperty.typologies)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          para({ color: "dark", size: "sm" }),
                          "flex w-full items-center justify-end gap-2"
                        )}
                      >
                        {selectedProperty.minSaleableArea} -{" "}
                        {selectedProperty.maxSaleableArea} sqft
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </Popup>
          )}
        </MapContainer>
      </div>
    </section>
  );
}
