"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/shadcn/ui/pagination";

interface PaginationProps {
  pageCount: number;
}

export function PaginationComponent({ pageCount }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Number(searchParams.get("page")) || 1;

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <Pagination>
      <PaginationContent className="flex gap-2">
        {/* Previous Button */}
        <PaginationItem>
          <button
            onClick={() =>
              currentPage > 1 && router.push(createPageURL(currentPage - 1))
            }
            disabled={currentPage <= 1}
            className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
        </PaginationItem>

        {/* Page Numbers */}
        {pages.map((page) => (
          <PaginationItem key={page}>
            <button
              onClick={() => router.push(createPageURL(page))}
              className={`px-3 py-1 rounded hover:bg-gray-200 ${
                page === currentPage
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {page}
            </button>
          </PaginationItem>
        ))}

        {/* Next Button */}
        <PaginationItem>
          <button
            onClick={() =>
              currentPage < pageCount &&
              router.push(createPageURL(currentPage + 1))
            }
            disabled={currentPage >= pageCount}
            className="px-3 py-1 rounded bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
