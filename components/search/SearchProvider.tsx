/**
 * @fileoverview SearchProvider Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { createContext, useContext, type ReactNode } from 'react';
import { useSearch } from '../../hooks/useSearch';
import type { SearchConfig, FilterValue, SortConfig, SearchResult } from '../../types/search';

interface SearchContextType {
  searchState: ReturnType<typeof useSearch>['searchState'];
  setQuery: (query: string) => void;
  setFilters: (filters: FilterValue[]) => void;
  addFilter: (filter: FilterValue) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
  setSort: (sort: SortConfig) => void;
  executeSearch: () => Promise<SearchResult>;
  loadMore: () => void;
  reset: () => void;
  hasActiveFilters: boolean;
  hasResults: boolean;
  isEmpty: boolean;
  normalizeText: (text: string) => string;
  fuzzyMatch: (query: string, target: string) => boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
  config: SearchConfig;
  data?: any[];
  onSearch?: (
    query: string,
    filters: FilterValue[],
    sort: SortConfig,
  ) => Promise<SearchResult> | SearchResult;
  initialQuery?: string;
  initialFilters?: FilterValue[];
  initialSort?: SortConfig;
}

/**
 * SearchProvider function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function SearchProvider({
  children,
  config,
  data,
  onSearch,
  initialQuery,
  initialFilters,
  initialSort,
}: SearchProviderProps) {
  const searchMethods = useSearch({
    config,
    data,
    onSearch,
    initialQuery,
    initialFilters,
    initialSort,
  });

  return <SearchContext.Provider value={searchMethods}>{children}</SearchContext.Provider>;
}

/**
 * useSearchContext function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useSearchContext(): SearchContextType {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}

// Helper hook for quick search setup
/**
 * useQuickSearch function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useQuickSearch(
  moduleName: keyof import('../../types/search').SEARCH_SUGGESTIONS,
) {
  const { setQuery } = useSearchContext();

  const quickSearch = (suggestion: string) => {
    setQuery(suggestion);
  };

  return { quickSearch };
}
