import { useState, useMemo, useCallback } from 'react';

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
  maxPageNumbers?: number;
  boundaryCount?: number;
  siblingCount?: number;
  onPageChange?: (page: number) => void;
}

export function usePagination({
  totalItems,
  itemsPerPage = 20,
  initialPage = 1,
  maxPageNumbers = 7,
  boundaryCount = 1,
  siblingCount = 1,
  onPageChange,
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage);
  }, [totalItems, itemsPerPage]);

  // Calculate current page range
  const pageRange = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      start: startIndex + 1,
      end: endIndex,
      total: totalItems,
    };
  }, [currentPage, itemsPerPage, totalItems]);

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    if (totalPages <= maxPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const startPage = Math.max(1, currentPage - siblingCount);
    const endPage = Math.min(totalPages, currentPage + siblingCount);

    const pages: (number | string)[] = [];

    // Add first page(s)
    for (let i = 1; i <= Math.min(boundaryCount, totalPages); i++) {
      pages.push(i);
    }

    // Add ellipsis if needed
    if (startPage > boundaryCount + 1) {
      pages.push('...');
    }

    // Add middle pages
    for (
      let i = Math.max(startPage, boundaryCount + 1);
      i <= Math.min(endPage, totalPages - boundaryCount);
      i++
    ) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Add ellipsis if needed
    if (endPage < totalPages - boundaryCount) {
      pages.push('...');
    }

    // Add last page(s)
    for (let i = Math.max(totalPages - boundaryCount + 1, endPage + 1); i <= totalPages; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    return pages;
  }, [currentPage, totalPages, maxPageNumbers, boundaryCount, siblingCount]);

  // Navigation functions
  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;

      setCurrentPage(page);
      onPageChange?.(page);
    },
    [totalPages, onPageChange],
  );

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // Computed properties
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Get items for current page (for client-side pagination)
  const getPageItems = useCallback(
    <T>(items: T[]): T[] => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return items.slice(startIndex, endIndex);
    },
    [currentPage, itemsPerPage],
  );

  // Reset to first page (useful when filters change)
  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Page size options
  const pageSizeOptions = [10, 20, 50, 100];

  // Change page size
  const changePageSize = useCallback(
    (newSize: number) => {
      // Calculate what the new page should be to keep the same item visible
      const currentFirstItem = (currentPage - 1) * itemsPerPage + 1;
      const newPage = Math.ceil(currentFirstItem / newSize);

      setCurrentPage(newPage);
      onPageChange?.(newPage);
    },
    [currentPage, itemsPerPage, onPageChange],
  );

  // Get pagination info for display
  const getPaginationInfo = useCallback(() => {
    if (totalItems === 0) {
      return 'Sonuç bulunamadı';
    }

    const { start, end, total } = pageRange;
    return `${start}-${end} / ${total} sonuç`;
  }, [pageRange, totalItems]);

  // Get pagination summary for mobile
  const getMobilePaginationInfo = useCallback(() => {
    if (totalItems === 0) {
      return 'Sonuç yok';
    }

    return `Sayfa ${currentPage} / ${totalPages}`;
  }, [currentPage, totalPages, totalItems]);

  return {
    // State
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    pageRange,
    pageNumbers,

    // Navigation
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    resetToFirstPage,

    // Computed
    hasNextPage,
    hasPreviousPage,
    isFirstPage,
    isLastPage,

    // Utilities
    getPageItems,
    changePageSize,
    pageSizeOptions,
    getPaginationInfo,
    getMobilePaginationInfo,
  };
}
