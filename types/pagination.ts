/**
 * @fileoverview Pagination Types
 * @description Type definitions for pagination functionality
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// =============================================================================
// PAGINATION CONFIGURATION
// =============================================================================

/**
 * Pagination hook options
 */
export interface UsePaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
  maxPageNumbers?: number;
  boundaryCount?: number;
  siblingCount?: number;
  onPageChange?: (page: number) => void;
}

/**
 * Pagination state
 */
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Page range information
 */
export interface PageRange {
  start: number;
  end: number;
  total: number;
}

/**
 * Pagination actions
 */
export interface PaginationActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
}

// =============================================================================
// INFINITE SCROLL
// =============================================================================

/**
 * Infinite scroll options
 */
export interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
  onLoadMore?: () => void | Promise<void>;
}

/**
 * Infinite scroll state
 */
export interface InfiniteScrollState {
  isLoading: boolean;
  hasMore: boolean;
  page: number;
  error?: string;
}

/**
 * Infinite scroll actions
 */
export interface InfiniteScrollActions {
  loadMore: () => void;
  reset: () => void;
  setHasMore: (hasMore: boolean) => void;
}

// =============================================================================
// CURSOR-BASED PAGINATION
// =============================================================================

/**
 * Cursor pagination options
 */
export interface CursorPaginationOptions {
  limit: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
}

/**
 * Cursor pagination result
 */
export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor?: string;
  previousCursor?: string;
  hasMore: boolean;
}
