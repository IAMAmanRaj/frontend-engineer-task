"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  FaMapMarkerAlt,
  FaRulerCombined,
  FaHome,
  FaStar,
  FaMap,
  FaSortAmountDown,
} from "react-icons/fa";
import { MdApartment } from "react-icons/md";
import { BiRupee } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";

import { useRouter, useSearchParams } from "next/navigation";
import { PaginationComponent } from "./Pagination";

import dynamic from "next/dynamic";

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

const BHK_OPTIONS = [
  { label: "1 BHK", value: 1 },
  { label: "2 BHK", value: 2 },
  { label: "3 BHK", value: 3 },
  { label: "4 BHK", value: 4 },
  { label: "5 BHK", value: 5 },
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

  const [openType, setOpenType] = useState(false);
  const [selectedTypeTab, setSelectedTypeTab] = useState<
    "Flat" | "Villa" | "Plot"
  >("Flat");
  const [selectedFlats, setSelectedFlats] = useState<number[]>([]);
  const [selectedVillas, setSelectedVillas] = useState<number[]>([]);
  const [plotArea, setPlotArea] = useState<string>("");

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
    const apartments = searchParams.get("apartments");
    const villas = searchParams.get("villas");
    const plot = searchParams.get("plotArea");

    if (apartments) {
      setSelectedFlats(apartments.split("+").map(Number));
    } else {
      setSelectedFlats([]);
    }
    if (villas) {
      setSelectedVillas(villas.split("+").map(Number));
    } else {
      setSelectedVillas([]);
    }
    if (plot) {
      setPlotArea(plot);
    } else {
      setPlotArea("");
    }
  }, [searchParams]);

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

        const apartmentsParam = searchParams.get("apartments");
        const villasParam = searchParams.get("villas");
        const plotAreaParam = searchParams.get("plotArea");

        const queryParams = new URLSearchParams();
        queryParams.set("query", query);
        queryParams.set("page", currentPage.toString());
        queryParams.set("minBudget", safeMin.toString());
        queryParams.set("maxBudget", safeMax.toString());
        queryParams.set("sortType", safeSortType);
        queryParams.set("sortOrder", safeSortOrder);
        queryParams.set("possession", safePossession);

        if (apartmentsParam) queryParams.set("apartments", apartmentsParam);
        if (villasParam) queryParams.set("villas", villasParam);
        if (plotAreaParam) queryParams.set("plotArea", plotAreaParam);

        const url = `${apiUrl}/api/properties?${queryParams.toString()}`;

        const res = await fetch(url);
        const data = await res.json();

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

  const toggleFlatSelection = (bhk: number) => {
    setSelectedFlats((prev) =>
      prev.includes(bhk) ? prev.filter((b) => b !== bhk) : [...prev, bhk]
    );
  };

  const toggleVillaSelection = (bhk: number) => {
    setSelectedVillas((prev) =>
      prev.includes(bhk) ? prev.filter((b) => b !== bhk) : [...prev, bhk]
    );
  };

  const handleApplyTypeFilters = () => {
    const updates: Record<string, string> = {};

    if (selectedFlats.length > 0) {
      updates.apartments = selectedFlats.sort((a, b) => a - b).join("+");
    } else {
      updates.apartments = "";
    }

    if (selectedVillas.length > 0) {
      updates.villas = selectedVillas.sort((a, b) => a - b).join("+");
    } else {
      updates.villas = "";
    }

    if (plotArea && Number(plotArea) > 0) {
      updates.plotArea = plotArea;
    } else {
      updates.plotArea = "";
    }

    updateParamsBatch(updates);
    setOpenType(false);
  };

  const handleClearTypeFilters = () => {
    setSelectedFlats([]);
    setSelectedVillas([]);
    setPlotArea("");

    updateParamsBatch({
      apartments: "",
      villas: "",
      plotArea: "",
    });

    setOpenType(false);
  };

  const isTypeFilterActive =
    searchParams.get("apartments") ||
    searchParams.get("villas") ||
    searchParams.get("plotArea");

  const isBudgetActive =
    searchParams.get("minBudget") !== DEFAULTS.minBudget ||
    searchParams.get("maxBudget") !== DEFAULTS.maxBudget;

  const isTypeChanged = () => {
    const currentApartments = searchParams.get("apartments") || "";
    const currentVillas = searchParams.get("villas") || "";
    const currentPlotArea = searchParams.get("plotArea") || "";

    const newApartments =
      selectedFlats.length > 0
        ? selectedFlats.sort((a, b) => a - b).join("+")
        : "";
    const newVillas =
      selectedVillas.length > 0
        ? selectedVillas.sort((a, b) => a - b).join("+")
        : "";
    const newPlotArea = plotArea && Number(plotArea) > 0 ? plotArea : "";

    return (
      currentApartments !== newApartments ||
      currentVillas !== newVillas ||
      currentPlotArea !== newPlotArea
    );
  };

  const handleBudgetChange = (min: number, max: number) => {
    const currentMin = getParam("minBudget");
    const currentMax = getParam("maxBudget");

    if (
      currentMin === selectedMin.toString() &&
      currentMax === selectedMax.toString()
    ) {
      setOpenBudget(false);
      return;
    }

    updateParamsBatch({
      minBudget: min.toString(),
      maxBudget: max.toString(),
    });

    setOpenBudget(false);
  };

  const handleClearBudget = () => {
    const currentMin = getParam("minBudget");
    const currentMax = getParam("maxBudget");

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
    <div className="flex-1 overflow-none px-4 md:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto w-full overflow-x-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex relative justify-center sm:justify-start flex-wrap items-center gap-4">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setOpenType(!openType)}
                className={`group flex items-center gap-2 px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-300 shadow-sm ${
                  isTypeFilterActive
                    ? "bg-[#FF6D33] text-white border-[#FF6D33] shadow-lg shadow-orange-200"
                    : "bg-white border-gray-200 text-gray-700 hover:border-[#FF6D33] hover:text-[#FF6D33] hover:shadow-md"
                }`}
              >
                <FaHome
                  className={`text-lg transition-transform duration-300 ${
                    openType ? "rotate-12" : ""
                  }`}
                />
                <span>Property Type</span>
                {isTypeFilterActive && (
                  <span className="bg-white text-[#FF6D33] text-xs font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {openType && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute mt-3 w-80 rounded-2xl shadow-2xl bg-white border border-gray-200 p-5 z-30"
                  >
                    <div className="flex gap-2 mb-4 bg-gray-100 rounded-xl p-1">
                      {["Flat", "Villa", "Plot"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() =>
                            setSelectedTypeTab(tab as "Flat" | "Villa" | "Plot")
                          }
                          className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                            selectedTypeTab === tab
                              ? "bg-white text-[#FF6D33] shadow-md"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {selectedTypeTab === "Flat" && (
                      <div>
                        <h4 className="font-bold text-sm mb-3 text-gray-800">
                          Select BHK
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {BHK_OPTIONS.map((option) => (
                            <motion.button
                              key={option.value}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleFlatSelection(option.value)}
                              className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-300 ${
                                selectedFlats.includes(option.value)
                                  ? "bg-[#FF6D33] text-white border-[#FF6D33] shadow-lg shadow-orange-200"
                                  : "bg-white border-gray-200 text-gray-700 hover:border-[#FF6D33] hover:shadow-md"
                              }`}
                            >
                              {option.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTypeTab === "Villa" && (
                      <div>
                        <h4 className="font-bold text-sm mb-3 text-gray-800">
                          Select BHK
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {BHK_OPTIONS.map((option) => (
                            <motion.button
                              key={option.value}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleVillaSelection(option.value)}
                              className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-300 ${
                                selectedVillas.includes(option.value)
                                  ? "bg-[#FF6D33] text-white border-[#FF6D33] shadow-lg shadow-orange-200"
                                  : "bg-white border-gray-200 text-gray-700 hover:border-[#FF6D33] hover:shadow-md"
                              }`}
                            >
                              {option.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTypeTab === "Plot" && (
                      <div>
                        <h4 className="font-bold text-sm mb-3 text-gray-800">
                          Minimum Plot Area (sq.ft)
                        </h4>
                        <input
                          type="number"
                          value={plotArea}
                          onChange={(e) => setPlotArea(e.target.value)}
                          placeholder="e.g., 2000"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6D33] focus:border-transparent transition-all"
                          min="0"
                        />
                      </div>
                    )}

                    <div className="flex justify-between mt-5 pt-4 border-t border-gray-200">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleClearTypeFilters}
                        disabled={!isTypeFilterActive}
                        className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                          isTypeFilterActive
                            ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            : "bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Clear
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleApplyTypeFilters}
                        disabled={!isTypeChanged()}
                        className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all ${
                          isTypeChanged()
                            ? "bg-[#FF6D33] text-white hover:bg-black shadow-lg shadow-orange-200"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Apply
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setOpenBudget(!openBudget)}
                className={`group flex items-center gap-2 px-3 py-3 rounded-lg border-2 text-xs font-medium transition-all duration-300 shadow-sm ${
                  isBudgetActive
                    ? "bg-[#FF6D33] text-white border-[#FF6D33] shadow-lg shadow-orange-200"
                    : "bg-white border-gray-200 text-gray-700 hover:border-[#FF6D33] hover:text-[#FF6D33] hover:shadow-md"
                }`}
              >
                <BiRupee
                  className={`text-xl -mr-1  transition-transform duration-300`}
                />
                <span className="text-sm">Budget</span>
                {isBudgetActive && (
                  <span className="bg-white text-[#FF6D33] text-[10px] font-bold px-1.0 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {openBudget && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute w-[400px] mt-2 rounded-xl shadow-xl bg-white border border-gray-200 p-3 z-30"
                  >
                    <h4 className="font-bold text-xs mb-2 text-gray-800">
                      Minimum Budget
                    </h4>
                    <div className="grid grid-cols-2 gap-1 mb-3">
                      {MIN_BUDGET_OPTIONS.map((item) => (
                        <motion.button
                          key={item.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedMin(item.value);
                            if (selectedMax < item.value)
                              setSelectedMax(item.value);
                          }}
                          className={`px-2 py-1.5 rounded-lg border text-xs font-medium transition-all duration-300 ${
                            selectedMin === item.value
                              ? "bg-[#FF6D33] text-white border-[#FF6D33] shadow"
                              : "bg-white border-gray-200 text-gray-700 hover:border-[#FF6D33] hover:shadow-sm"
                          }`}
                        >
                          {item.label}
                        </motion.button>
                      ))}
                    </div>

                    <h4 className="font-bold text-xs mb-2 text-gray-800">
                      Maximum Budget
                    </h4>
                    <div className="grid grid-cols-2 gap-1 mb-3">
                      {MAX_BUDGET_OPTIONS.filter(
                        (x) => x.value >= selectedMin
                      ).map((item) => (
                        <motion.button
                          key={item.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedMax(item.value)}
                          className={`px-2 py-1.5 rounded-lg border text-xs font-medium transition-all duration-300 ${
                            selectedMax === item.value
                              ? "bg-[#FF6D33] text-white border-[#FF6D33] shadow"
                              : "bg-white border-gray-200 text-gray-700 hover:border-[#FF6D33] hover:shadow-sm"
                          }`}
                        >
                          {item.label}
                        </motion.button>
                      ))}
                    </div>

                    <div className="flex justify-between mt-3 pt-2 border-t border-gray-200">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleClearBudget}
                        disabled={isBudgetDefault}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                          isBudgetDefault
                            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        Clear
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleBudgetChange(selectedMin, selectedMax)
                        }
                        disabled={!isBudgetChanged}
                        className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                          isBudgetChanged
                            ? "bg-[#FF6D33] text-white hover:bg-black shadow shadow-orange-200"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Apply
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setOpenSort(!openSort)}
                className="group flex items-center gap-2 px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-300 shadow-sm bg-white border-gray-200 text-gray-700 hover:border-[#FF6D33] hover:text-[#FF6D33] hover:shadow-md"
              >
                <FaSortAmountDown
                  className={`text-lg transition-transform duration-300 ${
                    openSort ? "rotate-180" : ""
                  }`}
                />
                <span>Sort</span>
              </motion.button>

              <AnimatePresence>
                {openSort && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute mt-3 w-56 rounded-2xl shadow-2xl bg-white border border-gray-200 overflow-hidden z-30"
                  >
                    <ul className="py-2">
                      {[
                        {
                          label: "Price: High → Low",
                          type: "price",
                          order: "desc",
                        },
                        {
                          label: "Price: Low → High",
                          type: "price",
                          order: "asc",
                        },
                        {
                          label: "Possession: New → Old",
                          type: "possession",
                          order: "desc",
                        },
                        {
                          label: "Possession: Old → New",
                          type: "possession",
                          order: "asc",
                        },
                        {
                          label: "Propscore: High → Low",
                          type: "popularity",
                          order: "desc",
                        },
                        {
                          label: "Propscore: Low → High",
                          type: "popularity",
                          order: "asc",
                        },
                      ].map((option) => (
                        <li key={`${option.type}-${option.order}`}>
                          <motion.button
                            whileHover={{ x: 4 }}
                            onClick={() =>
                              handleSortSelect(option.type, option.order)
                            }
                            className={`w-full text-left px-5 py-3 text-sm font-medium transition-all duration-200 ${
                              selectedSort.type === option.type &&
                              selectedSort.order === option.order
                                ? "bg-[#FF6D33] text-white"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {option.label}
                          </motion.button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="vs:mx-auto sm:absolute right-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowMap((prev) => !prev)}
                className={`group relative flex items-center gap-3 px-6 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-300 overflow-hidden ${
                  showMap
                    ? "bg-gradient-to-r from-[#FF6D33] to-[#ff8555] text-white border-[#FF6D33] shadow-xl shadow-orange-300"
                    : "bg-white border-gray-200 text-gray-700 hover:border-[#FF6D33] hover:shadow-lg"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ${
                    showMap ? "translate-x-full" : "-translate-x-full"
                  }`}
                />

                <FaMap
                  className={`text-xl z-10 transition-all duration-300 ${
                    showMap ? "rotate-12 scale-110" : ""
                  }`}
                />
                <span className="z-10 ">
                  {showMap ? "Close Map" : "Map View"}
                </span>

                {showMap && (
                  <span className="absolute right-2 top-2 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          {(isTypeFilterActive || isBudgetActive) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Active Filters:
                </span>
                {searchParams.get("apartments") && (
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-[#FF6D33] px-3 py-1 rounded-full text-xs font-medium">
                    Apartments:{" "}
                    {searchParams.get("apartments")?.replace(/\+/g, ", ")} BHK
                  </span>
                )}
                {searchParams.get("villas") && (
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-[#FF6D33] px-3 py-1 rounded-full text-xs font-medium">
                    Villas: {searchParams.get("villas")?.replace(/\+/g, ", ")}{" "}
                    BHK
                  </span>
                )}
                {searchParams.get("plotArea") && (
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-[#FF6D33] px-3 py-1 rounded-full text-xs font-medium">
                    Plot: {searchParams.get("plotArea")}+ sq.ft
                  </span>
                )}
                {isBudgetActive && (
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-[#FF6D33] px-3 py-1 rounded-full text-xs font-medium">
                    Budget: {formatPrice(Number(currentMin))} -{" "}
                    {formatPrice(Number(currentMax))}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {showMap ? (
            <motion.div
              key="map-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="mb-6 h-[500px] w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200"
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
              className="min-h-screen pb-24"
            >
              <div className="mb-6">
                {hasAnyFilter && (
                  <div className="space-y-2">
                    {totalMatches > 0 ? (
                      <>
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

                        <p className="text-sm md:text-base font-bold text-gray-600">
                          <span className="font-semibold text-black">
                            {totalMatches.toLocaleString()}
                          </span>{" "}
                          properties found • currently viewing{" "}
                          <span className="font-semibold text-black">
                            {startRange}-{endRange}
                          </span>
                        </p>
                      </>
                    ) : (
                      <div className="text-center py-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-700">
                          No results found{query ? ` for "${query}"` : ""}
                        </h2>
                        <p className="text-gray-500 mt-2">
                          Try adjusting your search or filters to find what
                          you're looking for.
                        </p>
                      </div>
                    )}
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
      className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group ${
        property.propscore > 4
          ? "border-[#FF6D33] bg-gradient-to-br from-white via-white to-orange-50/30 hover:border-[#FF6D33]"
          : "border-gray-200 hover:border-[#FF6D33]"
      }`}
    >
      <div className="relative h-52 overflow-hidden bg-gray-50">
        <Image
          src={property.image}
          alt={property.alt || property.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-1.5 shadow-md">
          <span className="text-xs font-semibold text-black uppercase tracking-wide">
            {property.type}
          </span>
        </div>

        <div
          className={`absolute top-4 right-4 rounded-lg px-2.5 py-1.5 shadow-md ${
            property.propscore > 4
              ? "bg-gradient-to-r from-[#FF6D33] to-orange-400"
              : "bg-white"
          }`}
        >
          <div className="flex items-center gap-1">
            <FaStar
              className={`text-sm ${
                property.propscore > 4
                  ? "text-white"
                  : "text-[#FF6D33]"
              }`}
            />
            <span
              className={`text-sm font-semibold ${
                property.propscore > 4
                  ? "text-white"
                  : "text-black"
              }`}
            >
              {property.propscore.toFixed(1)}/5
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-xl font-bold text-black mb-2 line-clamp-1 group-hover:text-[#FF6D33] transition-colors">
            {property.name}
          </h3>

          <div className="flex items-start gap-2 mb-3">
            <FaMapMarkerAlt className="text-[#FF6D33] text-base mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700 leading-relaxed">
              {property.micromarket}, {property.city}
            </span>
          </div>

          <p className="text-xs text-gray-500">
            Developer:{" "}
            <span className="font-medium text-gray-700">
              {property.developerName}
            </span>
          </p>
        </div>

        <div>
          <p className="text-2xl font-bold text-black mb-1">
            {formatPrice(property.minPrice)} -{" "}
            {formatPrice(property.maxPrice)}
          </p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Price Range
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <MdApartment className="text-[#FF6D33] text-lg flex-shrink-0" />
            <div className="flex items-center gap-1.5 flex-wrap">
              {property.typologies.map(
                (type: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs font-medium text-gray-700 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200"
                  >
                    {type}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <FaRulerCombined className="text-[#FF6D33] text-lg flex-shrink-0" />
            <span className="text-sm text-gray-700">
              {formatArea(property.minSaleableArea)} -{" "}
              {formatArea(property.maxSaleableArea)}
            </span>
          </div>
        </div>

        <button className="w-full mt-4 bg-[#FF6D33] hover:bg-black text-white font-semibold py-3 rounded-lg transition-all duration-300 text-sm shadow-sm hover:shadow-md">
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
                  className="mt-6 fixed w-full bottom-0 left-1/2 -translate-x-1/2"
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
