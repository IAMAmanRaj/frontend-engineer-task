"use client";
import { useState, useRef, useEffect } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

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

  const handleSearch = useDebouncedCallback(async (term: string) => {
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
    if (!inputValue.trim()) {
      const params = new URLSearchParams(searchParams);
      params.delete("page");
      params.delete("name");
      params.delete("developerName");
      params.delete("micromarket");
      params.delete("search");
      return;
    }

    const params = new URLSearchParams(searchParams);

    params.set("search", inputValue.trim());
    params.delete("page");
    params.delete("name");
    params.delete("developerName");
    params.delete("micromarket");

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
    handleSearch(value);
  };

  return (
    <div
      onMouseLeave={() => {
        setSuggestions([]);
      }}
      className="relative w-full px-4 pb-8 md:px-6 lg:px-8"
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
          <div className="absolute left-0 top-full mt-2 w-full bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            {suggestions.map((s: any, i: number) => (
              <button
                key={i}
                ref={(el) => {
                  suggestionRefs.current[i] = el;
                }}
                className={`w-full text-left px-4 py-3 transition-colors duration-150 flex items-center justify-between group border-b border-gray-50 last:border-b-0 ${
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
                  className={`text-xs px-2 py-1 rounded-full ${
                    selectedIndex === i
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {s.type}
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
