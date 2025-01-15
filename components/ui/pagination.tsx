'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: { search?: string };
}

export function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: PaginationProps) {
  function getPageUrl(page: number) {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (searchParams.search) {
      params.set('search', searchParams.search);
    }
    return `/events?${params.toString()}`;
  }

  return (
    <div className="flex justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={currentPage <= 1}
      >
        <Link href={getPageUrl(currentPage - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="icon"
            asChild
          >
            <Link href={getPageUrl(page)}>{page}</Link>
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={currentPage >= totalPages}
      >
        <Link href={getPageUrl(currentPage + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
