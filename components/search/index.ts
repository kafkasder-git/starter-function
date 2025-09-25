/**
 * @fileoverview index Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// Search system exports
export { SearchProvider, useSearchContext, useQuickSearch } from './SearchProvider';
export { EnhancedSearchInput } from './EnhancedSearchInput';
export { FilterPanel } from './FilterPanel';
export { DataTable } from './DataTable';
// export { SearchExample } from './SearchExample'; // File doesn't exist

// Hooks
export { useSearch } from '../../hooks/useSearch';
export { usePagination } from '../../hooks/usePagination';

// Types
export type {
  SearchConfig,
  SearchState,
  SearchResult,
  FilterConfig,
  FilterValue,
  SortConfig,
  PaginationConfig,
  ExportConfig,
  SearchFacet,
} from '../../types/search';

// Constants
export {
  FILTER_PRESETS,
  SEARCH_OPERATORS,
  DATE_RANGE_PRESETS,
  SEARCH_SUGGESTIONS,
  TURKISH_CHAR_MAP,
} from '../../types/search';
