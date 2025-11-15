"use client";
import { useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [suggestions, setSuggestions] = useState<any>([]);

  const handleSearch = useDebouncedCallback(async (term) => {
    if (!term.trim()) {
      setSuggestions([]);
      return;
    }

    const response = await fetch(`${apiUrl}/api/search?q=${term}`, {
      cache: "no-store",
    });
    const data = await response.json();

    setSuggestions(data.suggestions || []);
  }, 300);

  function applySuggestion(suggestion: any) {
    const params = new URLSearchParams(searchParams);

    const fields = ["name", "developerName", "micromarket"];

    fields.forEach((field) => {
      if (field === suggestion.type) params.set(field, suggestion.label);
      else params.delete(field);
    });

    replace(`${pathname}?${params.toString()}`);

    setSuggestions([]);
  }

  return (
    <div className="relative flex flex-1 shrink-0">
      <input
        className="block w-full rounded-md border text-black border-gray-800 py-[9px] pl-10 text-sm outline-2"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={""}
      />

      <FaMagnifyingGlass className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-black" />

      {suggestions.length > 0 && (
        <div className="absolute left-0 top-12 w-full bg-white shadow-md rounded-md border z-50">
          {suggestions.map((s: any, i: number) => (
            <button
              key={i}
              className="w-full text-left px-3 py-2 hover:bg-gray-100"
              onClick={() => applySuggestion(s)}
            >
              {s.label}
              <span className="ml-2 text-xs text-gray-500">({s.type})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
