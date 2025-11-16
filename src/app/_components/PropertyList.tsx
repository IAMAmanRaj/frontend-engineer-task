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
      if (!query) return;

      const res = await fetch(
        `${apiUrl}/api/properties?query=${encodeURIComponent(
          query
        )}&page=${currentPage}`
      );

      const data = await res.json();
      console.log(data, "Data");
      setProperties(data.results);
    }

    load();
  }, [query]);

  console.log(properties);

  return <></>;
}
