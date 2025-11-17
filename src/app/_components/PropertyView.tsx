"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  FaMapMarkerAlt,
  FaRulerCombined,
  FaHome,
  FaStar,
} from "react-icons/fa";
import { MdApartment } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

import { useRouter, useSearchParams } from "next/navigation";
import { PaginationComponent } from "./Pagination";

import dynamic from 'next/dynamic';

const LazyMap = dynamic(() => import("@/components/discovery-map"), {
   ssr: false,
  loading: () => <p>Loading...</p>,
});


const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const DEFAULTS = {
  minBudget: "5000000",
  maxBudget: "30000000",
  sortType: "popularity",
  sortOrder: "desc",
  possession: "any",
};

const MIN_BUDGET_OPTIONS = [
  { label: "50L", value: 5000000 },
  { label: "75L", value: 7500000 },
  { label: "1 Cr", value: 10000000 },
  { label: "1.5 Cr", value: 15000000 },
  { label: "2 Cr", value: 20000000 },
  { label: "2.5 Cr", value: 25000000 },
  { label: "3 Cr", value: 30000000 },
];

const MAX_BUDGET_OPTIONS = [
  { label: "3 Cr", value: 30000000 },
  { label: "3.5 Cr", value: 35000000 },
  { label: "4 Cr", value: 40000000 },
  { label: "4.5 Cr", value: 45000000 },
  { label: "5 Cr", value: 50000000 },
  { label: "10 Cr", value: 100000000 },
  { label: "10 Cr+", value: 500000000 },
];

export default function PropertyView({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMatches, setTotalMatches] = useState(0);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [openSort, setOpenSort] = useState(false);
  const [selectedSort, setSelectedSort] = useState({
    type: "popularity",
    order: "desc",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const getParam = (key: keyof typeof DEFAULTS) => {
    return searchParams.get(key) ?? DEFAULTS[key];
  };

  const [openBudget, setOpenBudget] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [selectedMin, setSelectedMin] = useState(
    Number(getParam("minBudget") ?? MIN_BUDGET_OPTIONS[0].value)
  );

  const [selectedMax, setSelectedMax] = useState(
    Number(
      getParam("maxBudget") ??
        MAX_BUDGET_OPTIONS[MAX_BUDGET_OPTIONS.length - 1].value
    )
  );

  const currentMin = searchParams.get("minBudget") ?? DEFAULTS.minBudget;
  const currentMax = searchParams.get("maxBudget") ?? DEFAULTS.maxBudget;

  const isBudgetChanged =
    currentMin !== selectedMin.toString() ||
    currentMax !== selectedMax.toString();
  const isBudgetDefault =
    currentMin === DEFAULTS.minBudget && currentMax === DEFAULTS.maxBudget;

  const hasAnyFilter =
    query ||
    searchParams.get("minBudget") ||
    searchParams.get("maxBudget") ||
    searchParams.get("developerName") ||
    searchParams.get("micromarket") ||
    searchParams.get("name");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const safeMin = getParam("minBudget") ?? MIN_BUDGET_OPTIONS[0].value;
        const safeMax =
          getParam("maxBudget") ??
          MAX_BUDGET_OPTIONS[MAX_BUDGET_OPTIONS.length - 1].value;

        const safeSortType = getParam("sortType");
        const safeSortOrder = getParam("sortOrder");
        const safePossession = getParam("possession");

        const url = `${apiUrl}/api/properties?query=${encodeURIComponent(
          query
        )}&page=${currentPage}&minBudget=${safeMin}&maxBudget=${safeMax}&sortType=${safeSortType}&sortOrder=${safeSortOrder}&possession=${safePossession}`;

        const res = await fetch(url);
        const data = await res.json();

        console.log(data.query, "Query");
        console.log(data.currentPage, "Current Page");
        console.log(data.totalMatches, "Total Matches");
        console.log(data.totalPages, "Total Pages");

        setProperties(data.results);
        setTotalMatches(data.totalMatches || 0);
        setCurrentPageNum(data.currentPage || 1);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        console.error("Error loading properties:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [currentPage, searchParamsString]);

  const updateParamsBatch = (entries: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(entries).forEach(([k, v]) => {
      if (v === "") params.delete(k);
      else params.set(k, v);
    });

    params.delete("page");

    router.push(`?${params.toString()}`);
  };

  const handleBudgetChange = (min: number, max: number) => {
    const currentMin = getParam("minBudget");
    const currentMax = getParam("maxBudget");

    if (
      currentMin === selectedMin.toString() &&
      currentMax === selectedMax.toString()
    ) {
      console.log("No changes in budget, closing.");
      setOpenBudget(false);
      return;
    }

    console.log("Has changed -> Applying budget filters:", min, max);

    updateParamsBatch({
      minBudget: min.toString(),
      maxBudget: max.toString(),
    });

    setOpenBudget(false);
  };

  const handleClearBudget = () => {
    const currentMin = getParam("minBudget");
    const currentMax = getParam("maxBudget");

    console.log("current:", currentMin, currentMax);
    console.log("Selected:", selectedMin, selectedMax);

    if (
      currentMin === DEFAULTS.minBudget &&
      currentMax === DEFAULTS.maxBudget
    ) {
      setOpenBudget(false);
      return;
    }
    setSelectedMax(Number(DEFAULTS.maxBudget));
    setSelectedMin(Number(DEFAULTS.minBudget));

    updateParamsBatch({
      minBudget: DEFAULTS.minBudget,
      maxBudget: DEFAULTS.maxBudget,
    });

    setOpenBudget(false);
  };

  const handleSortSelect = (type: string, order: string) => {
    setSelectedSort({ type, order });
    setOpenSort(false);

    updateParamsBatch({
      sortType: type,
      sortOrder: order,
    });
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const formatArea = (area: number) => {
    return `${area.toLocaleString()} sq.ft`;
  };

  const propertiesPerPage = properties.length;
  const startRange =
    totalMatches > 0 ? (currentPageNum - 1) * propertiesPerPage + 1 : 0;
  const endRange = Math.min(
    (currentPageNum - 1) * propertiesPerPage + propertiesPerPage,
    totalMatches
  );

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
            >
              <div className="bg-gray-200 h-48 w-full" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1  overflow-none px-4 md:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto w-full overflow-x-hidden">
        <div className="flex gap-3 mb-6 flex-wrap relative z-30">
          <div className="relative inline-block text-left">
            <button
              onClick={() => setOpenBudget(!openBudget)}
              className="px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-[#FF6D33] hover:text-white transition"
            >
              Budget
            </button>

            {openBudget && (
              <div className="absolute mt-2 w-64 rounded-xl shadow-lg bg-white border border-gray-200 p-4 z-20">
                <h4 className="font-semibold text-sm mb-2">Minimum Budget</h4>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {MIN_BUDGET_OPTIONS.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => {
                        setSelectedMin(item.value);

                        if (selectedMax < item.value) {
                          setSelectedMax(item.value);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg border text-sm 
              ${
                selectedMin === item.value
                  ? "bg-[#FF6D33] text-white border-[#FF6D33]"
                  : "bg-white border-gray-300 text-gray-700"
              }
            `}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <h4 className="font-semibold text-sm mb-2">Maximum Budget</h4>
                <div className="grid grid-cols-2 gap-2 mb-3 max-h-40 overflow-y-auto">
                  {MAX_BUDGET_OPTIONS.filter((x) => x.value >= selectedMin).map(
                    (item) => (
                      <button
                        key={item.value}
                        onClick={() => setSelectedMax(item.value)}
                        className={`px-3 py-2 rounded-lg border text-sm 
                ${
                  selectedMax === item.value
                    ? "bg-[#FF6D33] text-white border-[#FF6D33]"
                    : "bg-white border-gray-300 text-gray-700"
                }
              `}
                      >
                        {item.label}
                      </button>
                    )
                  )}
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={handleClearBudget}
                    disabled={isBudgetDefault}
                    className={`px-3 py-2 text-sm rounded-lg ${
                      isBudgetDefault
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Clear
                  </button>

                  <button
                    onClick={() => handleBudgetChange(selectedMin, selectedMax)}
                    disabled={!isBudgetChanged}
                    className={`px-4 py-2 text-sm rounded-lg ${
                      isBudgetChanged
                        ? "bg-[#FF6D33] text-white hover:bg-black"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative inline-block text-left">
            <button
              onClick={() => setOpenSort(!openSort)}
              className="px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-[#FF6D33] hover:text-white transition"
            >
              Sort
            </button>

            {openSort && (
              <div className="absolute mt-2 w-52 rounded-xl shadow-lg bg-white border border-gray-200 z-20">
                <ul className="py-2 text-sm text-gray-700">
                  <li>
                    <button
                      onClick={() => handleSortSelect("price", "desc")}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100
                ${
                  selectedSort.type === "price" && selectedSort.order === "desc"
                    ? "bg-[#FF6D33] text-white"
                    : ""
                }`}
                    >
                      Price: High → Low
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() => handleSortSelect("price", "asc")}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100
                ${
                  selectedSort.type === "price" && selectedSort.order === "asc"
                    ? "bg-[#FF6D33] text-white"
                    : ""
                }`}
                    >
                      Price: Low → High
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() => handleSortSelect("possession", "desc")}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100
                ${
                  selectedSort.type === "possession" &&
                  selectedSort.order === "desc"
                    ? "bg-[#FF6D33] text-white"
                    : ""
                }`}
                    >
                      Possession: New → Old
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() => handleSortSelect("possession", "asc")}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100
                ${
                  selectedSort.type === "possession" &&
                  selectedSort.order === "asc"
                    ? "bg-[#FF6D33] text-white"
                    : ""
                }`}
                    >
                      Possession: Old → New
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() => handleSortSelect("popularity", "desc")}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100
                ${
                  selectedSort.type === "popularity" &&
                  selectedSort.order === "desc"
                    ? "bg-[#FF6D33] text-white"
                    : ""
                }`}
                    >
                      Propscore: High → Low
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() => handleSortSelect("popularity", "asc")}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100
                ${
                  selectedSort.type === "popularity" &&
                  selectedSort.order === "asc"
                    ? "bg-[#FF6D33] text-white"
                    : ""
                }`}
                    >
                      Propscore: Low → High
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowMap((prev) => !prev)}
            className="px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-[#FF6D33] hover:text-white transition"
          >
            {showMap ? "Close Map" : "Map View"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {showMap ? (
            <motion.div
              key="map-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="mb-6 h-[500px] w-full"
            >
              <LazyMap allFilteredData={{ projects: properties }} />
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="h-full"
            >
              <div className="mb-6">
                {hasAnyFilter && (
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-black">
                      {query ? (
                        <>
                          Showing results for{" "}
                          <span className="text-[#FF6D33]">"{query}"</span>
                        </>
                      ) : (
                        <>Showing filtered results</>
                      )}
                    </h2>

                    <p className="text-sm md:text-base text-gray-600">
                      <span className="font-semibold text-black">
                        {totalMatches.toLocaleString()}
                      </span>{" "}
                      properties found • currently viewing{" "}
                      <span className="font-semibold text-black">
                        {startRange}-{endRange}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6"
              >
                {properties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#FF6D33] transition-all duration-300 cursor-pointer group"
                  >
                    <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
                      <Image
                        src={property.image}
                        alt={property.alt || property.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />

                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                        <FaStar className="text-[#FF6D33] text-xs" />
                        <span className="text-sm font-bold text-black">
                          {property.propscore.toFixed(1)}
                        </span>
                      </div>

                      <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1.5">
                        <span className="text-xs font-medium text-white">
                          {property.type}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 md:p-5 space-y-3">
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-black group-hover:text-[#FF6D33] transition-colors line-clamp-1">
                          {property.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          by{" "}
                          <span className="font-medium text-black">
                            {property.developerName}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <FaMapMarkerAlt className="text-[#FF6D33] text-sm mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          {property.micromarket}, {property.city}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <MdApartment className="text-gray-600 text-base flex-shrink-0" />
                        {property.typologies.map(
                          (type: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
                            >
                              {type}
                            </span>
                          )
                        )}
                      </div>

                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">
                            Price Range
                          </span>
                          <div className="text-right">
                            <p className="text-sm md:text-base font-bold text-black">
                              {formatPrice(property.minPrice)} -{" "}
                              {formatPrice(property.maxPrice)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FaRulerCombined className="text-gray-600 text-sm flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs text-gray-500">Area: </span>
                          <span className="text-sm font-semibold text-black">
                            {formatArea(property.minSaleableArea)} -{" "}
                            {formatArea(property.maxSaleableArea)}
                          </span>
                        </div>
                      </div>

                      <button className="w-full mt-3 bg-[#FF6D33] hover:bg-black text-white font-medium py-2.5 rounded-full transition-all duration-300 text-sm md:text-base">
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="mt-6"
                >
                  <PaginationComponent pageCount={totalPages} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
