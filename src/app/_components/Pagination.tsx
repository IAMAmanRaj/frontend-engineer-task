"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

interface PaginationProps {
  pageCount: number;
}

export function PaginationComponent({ pageCount }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Number(searchParams.get("page")) || 1;

  console.log("page count:", pageCount);

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(pageCount - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < pageCount - 1) {
      rangeWithDots.push('...', pageCount);
    } else if (pageCount > 1) {
      rangeWithDots.push(pageCount);
    }

    return rangeWithDots;
  };

  const pages = pageCount <= 7 
    ? Array.from({ length: pageCount }, (_, i) => i + 1)
    : getPageNumbers();

  if (pageCount <= 1) return null;

  return (
    <div className="bg-white border-t border-gray-100 px-4 md:px-6 lg:px-8 py-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
   
        <button
          onClick={() =>
            currentPage > 1 && router.push(createPageURL(currentPage - 1))
          }
          disabled={currentPage <= 1}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-white border-2 border-gray-200 text-black hover:border-[#FF6D33] hover:text-[#FF6D33] disabled:hover:border-gray-200 disabled:hover:text-black"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-1 md:gap-2">
          {pages.map((page, idx) => (
            <div key={idx}>
              {page === '...' ? (
                <span className="px-2 py-2 text-gray-400">...</span>
              ) : (
                <button
                  onClick={() => router.push(createPageURL(page as number))}
                  className={`min-w-[40px] h-10 px-3 rounded-full font-medium transition-all duration-200 ${
                    page === currentPage
                      ? "bg-[#FF6D33] text-white shadow-lg scale-110"
                      : "bg-white border-2 border-gray-200 text-black hover:border-[#FF6D33] hover:text-[#FF6D33] hover:scale-105"
                  }`}
                  style={page === currentPage ? { boxShadow: '0 10px 25px rgba(255, 109, 51, 0.3)' } : {}}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() =>
            currentPage < pageCount &&
            router.push(createPageURL(currentPage + 1))
          }
          disabled={currentPage >= pageCount}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-[#FF6D33] text-white hover:bg-black disabled:hover:bg-[#FF6D33]"
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="text-center mt-3">
        <p className="text-sm text-gray-500">
          Page <span className="font-bold text-black">{currentPage}</span> of{" "}
          <span className="font-bold text-black">{pageCount}</span>
        </p>
      </div>
    </div>
  );
}