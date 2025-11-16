"use client";

import { useEffect, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function PropertyList({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(
        `${apiUrl}/api/properties?query=${encodeURIComponent(
          query
        )}&page=${currentPage}`
      );

      const data = await res.json();

      console.log(data.query, "Query");
      console.log(data.currentPage, "Current Page");
      console.log(data.totalMatches, "Total Matches");
      console.log(data.totalPages, "Total Pages");

      setProperties(data.results);
    }

    load();
  }, [query, currentPage]);

  console.log(properties);

  return <></>;
}
