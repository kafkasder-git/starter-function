import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import type {
  SearchState,
  SearchConfig,
  FilterValue,
  SortConfig,
  SearchResult,
} from '../types/search';
import { TURKISH_CHAR_MAP } from '../types/search';

interface UseSearchProps<T = unknown> {
  config: SearchConfig;
  data?: T[];
  onSearch?: (
    query: string,
    filters: FilterValue[],
    sort: SortConfig,
  ) => Promise<SearchResult<T>> | SearchResult<T>;
  initialQuery?: string;
  initialFilters?: FilterValue[];
  initialSort?: SortConfig;
}

// Filter operator functions map for better performance and maintainability
const filterOperators = new Map<string, (value: any, filterValue: any) => boolean>([
  ['eq', (value, filterValue) => value === filterValue],
  ['ne', (value, filterValue) => value !== filterValue],
  ['gt', (value, filterValue) => Number(value) > Number(filterValue)],
  ['gte', (value, filterValue) => Number(value) >= Number(filterValue)],
  ['lt', (value, filterValue) => Number(value) < Number(filterValue)],
  ['lte', (value, filterValue) => Number(value) <= Number(filterValue)],
  ['contains', (value, filterValue) => String(value).toLowerCase().includes(String(filterValue).toLowerCase())],
  ['startsWith', (value, filterValue) => String(value).toLowerCase().startsWith(String(filterValue).toLowerCase())],
  ['endsWith', (value, filterValue) => String(value).toLowerCase().endsWith(String(filterValue).toLowerCase())],
  ['in', (value, filterValue) => Array.isArray(filterValue) && filterValue.includes(value)],
  ['between', (value, filterValue) => {
    if (!Array.isArray(filterValue) || filterValue.length !== 2) return false;
    const numValue = Number(value);
    return numValue >= Number(filterValue[0]) && numValue <= Number(filterValue[1]);
  }],
]);

export function useSearch<T = unknown>({
  config,
  data = [],
  onSearch,
  initialQuery = '',
  initialFilters = [],
  initialSort,
}: UseSearchProps<T>) {
  const [searchState, setSearchState] = useState<SearchState>({
    query: initialQuery,
    filters: initialFilters,
    sort: initialSort || config.defaultSort || { field: 'id', direction: 'desc' },
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: config.itemsPerPage || 20,
    isLoading: false,
    results: [],
    hasMore: false,
    lastSearchTime: null,
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Debounced search query
  const debouncedQuery = useDebounce(searchState.query, config.debounceMs || 300);

  // Turkish character normalization
  const normalizeText = useCallback(
    (text: string): string => {
      if (!config.enableTurkishSearch) return text.toLowerCase().trim();
      return text
        .toLowerCase()
        .replace(/[çğıöşüÇĞIÖŞÜ]/g, (char) => TURKISH_CHAR_MAP[char] || char)
        .trim();
    },
    [config.enableTurkishSearch],
  );

  // Fuzzy search implementation
  const fuzzyMatch = useCallback(
    (query: string, target: string): boolean => {
      if (!config.enableFuzzySearch) {
        return normalizeText(target).includes(normalizeText(query));
      }

      const normalizedQuery = normalizeText(query);
      const normalizedTarget = normalizeText(target);
      let queryIndex = 0;

      for (const char of normalizedTarget) {
        if (char === normalizedQuery[queryIndex]) queryIndex++;
        if (queryIndex === normalizedQuery.length) break;
      }

      return queryIndex === normalizedQuery.length;
    },
    [config.enableFuzzySearch, normalizeText],
  );

  // Optimized nested value getter
  const getNestedValue = useCallback((obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }, []);

  // Optimized filter application
  const applyFilter = useCallback((value: any, filter: FilterValue): boolean => {
    if (value == null) return false;
    const { operator = 'eq', value: filterValue } = filter;
    const operatorFn = filterOperators.get(operator);
    return operatorFn ? operatorFn(value, filterValue) : true;
  }, []);

  // Optimized sort function
  const sortItems = useCallback((items: T[], sort: SortConfig) => {
    if (!sort.field) return items;

    return [...items].sort((a, b) => {
      const aValue = getNestedValue(a, sort.field);
      const bValue = getNestedValue(b, sort.field);

      if (aValue == null || bValue == null) {
        return (aValue == null ? 1 : 0) - (bValue == null ? 1 : 0);
      }

      const comparison = typeof aValue === 'string' && typeof bValue === 'string'
        ? aValue.localeCompare(bValue, 'tr')
        : typeof aValue === 'number' && typeof bValue === 'number'
        ? aValue - bValue
        : aValue instanceof Date && bValue instanceof Date
        ? aValue.getTime() - bValue.getTime()
        : String(aValue).localeCompare(String(bValue), 'tr');

      return sort.direction === 'desc' ? -comparison : comparison;
    });
  }, [getNestedValue]);

  // Local search implementation
  const performLocalSearch = useCallback(
    (query: string, filters: FilterValue[], sort: SortConfig, page = 1): SearchResult => {
      const startTime = performance.now();

      // Apply text search
      const textFiltered = query.trim()
        ? data.filter((item) =>
            config.searchableFields.some((field) => {
              const value = getNestedValue(item, field);
              return value != null && fuzzyMatch(query, String(value));
            })
          )
        : data;

      // Apply filters
      const filtered = filters.length
        ? textFiltered.filter((item) =>
            filters.every((filter) => applyFilter(getNestedValue(item, filter.field), filter))
          )
        : textFiltered;

      // Apply sorting
      const sorted = sortItems(filtered, sort);

      const totalCount = sorted.length;
      const startIndex = (page - 1) * searchState.itemsPerPage;
      const endIndex = startIndex + searchState.itemsPerPage;
      const pageItems = sorted.slice(startIndex, endIndex);

      return {
        items: pageItems,
        totalCount,
        filteredCount: totalCount,
        searchTime: performance.now() - startTime,
      };
    },
    [
      data,
      config.searchableFields,
      fuzzyMatch,
      getNestedValue,
      applyFilter,
      sortItems,
      searchState.itemsPerPage,
    ],
  );

  // Execute search with optimized error handling
  const executeSearch = useCallback(
    async (
      query: string = searchState.query,
      filters: FilterValue[] = searchState.filters,
      sort: SortConfig = searchState.sort,
      page = 1,
      append = false,
    ) => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setSearchState((prev) => ({ ...prev, isLoading: true }));

      try {
        const result = onSearch
          ? await onSearch(query, filters, sort)
          : performLocalSearch(query, filters, sort, page);

        const totalPages = Math.ceil(result.totalCount / searchState.itemsPerPage);

        setSearchState((prev) => ({
          ...prev,
          results: append ? [...prev.results, ...result.items] : result.items,
          totalItems: result.totalCount,
          totalPages,
          currentPage: page,
          hasMore: page < totalPages,
          isLoading: false,
          lastSearchTime: new Date(),
        }));

        return result;
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Search error:', error);
          setSearchState((prev) => ({
            ...prev,
            isLoading: false,
            results: [],
            totalItems: 0,
            totalPages: 1,
            hasMore: false,
          }));
        }
        throw error;
      }
    },
    [searchState.query, searchState.filters, searchState.sort, searchState.itemsPerPage, onSearch, performLocalSearch],
  );

  // Optimized state update functions
  const setQuery = useCallback((query: string) => {
    setSearchState((prev) => ({ ...prev, query, currentPage: 1 }));
  }, []);

  const setFilters = useCallback((filters: FilterValue[]) => {
    setSearchState((prev) => ({ ...prev, filters, currentPage: 1 }));
  }, []);

  const addFilter = useCallback((filter: FilterValue) => {
    setSearchState((prev) => {
      const existingIndex = prev.filters.findIndex((f) => f.field === filter.field);
      const newFilters = existingIndex >= 0
        ? prev.filters.map((f, i) => (i === existingIndex ? filter : f))
        : [...prev.filters, filter];
      return { ...prev, filters: newFilters, currentPage: 1 };
    });
  }, []);

  const removeFilter = useCallback((field: string) => {
    setSearchState((prev) => ({
      ...prev,
      filters: prev.filters.filter((f) => f.field !== field),
      currentPage: 1,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchState((prev) => ({ ...prev, filters: [], currentPage: 1 }));
  }, []);

  const setSort = useCallback((sort: SortConfig) => {
    setSearchState((prev) => ({ ...prev, sort, currentPage: 1 }));
  }, []);

  const loadMore = useCallback(() => {
    if (!searchState.hasMore || searchState.isLoading) return;
    executeSearch(
      searchState.query,
      searchState.filters,
      searchState.sort,
      searchState.currentPage + 1,
      true,
    );
  }, [searchState, executeSearch]);

  const reset = useCallback(() => {
    setSearchState((prev) => ({
      ...prev,
      query: '',
      filters: [],
      sort: config.defaultSort || { field: 'id', direction: 'desc' },
      currentPage: 1,
      results: [],
      totalItems: 0,
      totalPages: 1,
      hasMore: false,
    }));
  }, [config.defaultSort]);

  // Auto-search effect with cleanup
  useEffect(() => {
    searchTimeoutRef.current && clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => executeSearch(), 100);
    return () => searchTimeoutRef.current && clearTimeout(searchTimeoutRef.current);
  }, [debouncedQuery, searchState.filters, searchState.sort, executeSearch]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      searchTimeoutRef.current && clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // Memoized computed values with optimized dependencies
  const computedValues = useMemo(
    () => ({
      hasActiveFilters: searchState.filters.length > 0,
      hasResults: searchState.results.length > 0,
      isEmpty: !searchState.isLoading && searchState.results.length === 0 && (searchState.query || searchState.filters.length > 0),
    }),
    [searchState.filters.length, searchState.results.length, searchState.isLoading, searchState.query],
  );

  return {
    searchState,
    setQuery,
    setFilters,
    addFilter,
    removeFilter,
    clearFilters,
    setSort,
    executeSearch,
    loadMore,
    reset,
    ...computedValues,
    normalizeText,
    fuzzyMatch,
  };
}
