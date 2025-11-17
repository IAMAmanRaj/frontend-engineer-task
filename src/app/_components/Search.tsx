"use client";
import { useState, useRef, useEffect } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { FaMapMarkerAlt as LocationIcon } from "react-icons/fa";
import { FaTools as ToolIcon } from "react-icons/fa";
import { FaUserTie as DeveloperIcon } from "react-icons/fa";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const debouncedSearch = useDebouncedCallback(async (term: string) => {
    if (!term.trim()) {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/api/search-suggestions?q=${term}`,
        {
          cache: "no-store",
        }
      );
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  }, 300);

  function applySuggestion(suggestion: any) {
    const params = new URLSearchParams(searchParams);

    const fields = ["name", "developerName", "micromarket"];

    fields.forEach((field) => {
      if (field === suggestion.type) params.set(field, suggestion.label);
      else params.delete(field);
    });
    params.delete("page");
    params.delete("search");

    replace(`${pathname}?${params.toString()}`);

    setSuggestions([]);
    setSelectedIndex(-1);
    setInputValue(suggestion.label);
  }

  function applyManualSearch() {
    // Cancel any pending debounced search
    debouncedSearch.cancel();

    const trimmed = inputValue.trim();

    const params = new URLSearchParams(searchParams);

    const DEFAULTS = {
      minBudget: "5000000",
      maxBudget: "30000000",
      sortType: "popularity",
      sortOrder: "desc",
      possession: "any",
      page: "1",
    };

    if (!trimmed) {
      params.delete("search");
      params.delete("name");
      params.delete("developerName");
      params.delete("micromarket");

      Object.entries(DEFAULTS).forEach(([key, value]) => {
        if (!params.has(key)) params.set(key, value);
      });

      params.set("page", DEFAULTS.page);

      replace(`${pathname}?${params.toString()}`);
      return;
    }

    params.set("search", trimmed);
    params.delete("name");
    params.delete("developerName");
    params.delete("micromarket");

    Object.entries(DEFAULTS).forEach(([key, value]) => {
      if (!params.has(key)) params.set(key, value);
    });

    params.set("page", DEFAULTS.page);

    replace(`${pathname}?${params.toString()}`);

    setSuggestions([]);
    setSelectedIndex(-1);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) {
      if (e.key === "Enter") {
        applyManualSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex = prev < suggestions.length - 1 ? prev + 1 : prev;
          return newIndex;
        });
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev <= 0) {
            inputRef.current?.focus();
            return -1;
          }
          return prev - 1;
        });
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          applySuggestion(suggestions[selectedIndex]);
        } else {
          applyManualSearch();
        }
        break;

      case "Escape":
        setSuggestions([]);
        setSelectedIndex(-1);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  return (
    <div
      onMouseLeave={() => {
        setSuggestions([]);
      }}
      className="relative w-full px-4 md:px-6 lg:px-8"
    >
      <div className="relative flex items-center max-w-3xl mx-auto">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <FaMagnifyingGlass className="h-5 w-5 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          className={`w-full rounded-full border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-sm md:text-base text-black placeholder-gray-400 outline-none transition-all duration-200 focus:border-[#FF6D33] focus:ring-2 focus:ring-[#FF6D33] focus:ring-opacity-20`}
          placeholder={placeholder}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          value={inputValue}
        />

        {suggestions.length > 0 && (
          <div className="absolute left-0 top-full mt-2 w-full bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shadow-lg rounded-2xl border border-gray-300 overflow-hidden z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            {suggestions.map((s: any, i: number) => (
              <button
                key={i}
                ref={(el) => {
                  suggestionRefs.current[i] = el;
                }}
                className={`w-full hover:cursor-pointer text-left px-4 py-3 transition-all duration-150 flex items-center justify-between group border-b border-gray-50 last:border-b-0 ${
                  selectedIndex === i
                    ? "bg-[#FF6D33] text-white"
                    : "hover:bg-gray-50 text-black"
                }`}
                onClick={() => applySuggestion(s)}
                onMouseEnter={() => setSelectedIndex(i)}
                onMouseLeave={() => {
                  setSelectedIndex(-1);
                }}
              >
                <span
                  className={`text-sm md:text-base transition-colors ${
                    selectedIndex === i
                      ? "text-white"
                      : "group-hover:text-[#FF6D33]"
                  }`}
                >
                  {s.label}
                </span>
                <span
                  className={`flex items-center gap-1 text-[15px] px-2 py-1 rounded-full ${
                    selectedIndex === i
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {/* Icon based on type */}
                  {s.type === "developerName" && (
                    <>
                      <DeveloperIcon className="inline-block text-[17px]" />
                      <span className="capitalize">Developer</span>
                    </>
                  )}
                  {s.type === "micromarket" && (
                    <>
                      <LocationIcon className="inline-block text-[17px]" />
                      <span className="capitalize">Location</span>
                    </>
                  )}
                  {s.type === "name" && (
                    <>
                      <ToolIcon className="inline-block text-[17px]" />
                      <span className="capitalize">Project</span>
                    </>
                  )}

                  {/* Display type text */}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="max-w-3xl mx-auto mt-2">
          <p className="text-xs text-gray-400 text-center">
            Use ↑↓ to navigate • Enter to select • Esc to close
          </p>
        </div>
      )}
    </div>
  );
}
