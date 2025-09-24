import type { KeyboardEvent } from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Filter, Clock, TrendingUp, Loader2, Command, History } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Command as CommandPrimitive,
  CommandInput,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from '../ui/command';
import { useSearchContext } from './SearchProvider';
import { useIsMobile } from '../../hooks/useTouchDevice';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { cn } from '../ui/utils';
import { SEARCH_SUGGESTIONS } from '../../types/search';

interface EnhancedSearchInputProps {
  placeholder?: string;
  className?: string;
  module?: keyof typeof SEARCH_SUGGESTIONS;
  showFilters?: boolean;
  showShortcuts?: boolean;
  autoFocus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'full';
}

export function EnhancedSearchInput({
  placeholder = 'Arama yapın...',
  className,
  module = 'member',
  showFilters = true,
  showShortcuts = true,
  autoFocus = false,
  size = 'md',
  variant = 'default',
}: EnhancedSearchInputProps) {
  const isMobile = useIsMobile();
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { searchState, setQuery, hasActiveFilters, clearFilters, normalizeText } =
    useSearchContext();

  // Search history
  const [searchHistory, setSearchHistory] = useLocalStorage<string[]>(
    `search-history-${module}`,
    [],
  );

  // Recent searches from localStorage
  const addToHistory = (query: string) => {
    if (!query.trim() || searchHistory.includes(query)) return;

    const newHistory = [query, ...searchHistory.slice(0, 9)]; // Keep last 10
    setSearchHistory(newHistory);
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  // Size variants
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg',
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.length > 0 || searchHistory.length > 0);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    addToHistory(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      if (searchState.query.trim()) {
        addToHistory(searchState.query);
      }
      setShowSuggestions(false);
    }
  };

  // Focus management
  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Get suggestions based on module and search query
  const getSuggestions = () => {
    const moduleSuggestions = SEARCH_SUGGESTIONS[module] || [];
    const query = searchState.query.toLowerCase();

    if (!query) {
      return {
        recent: searchHistory.slice(0, 5),
        suggestions: moduleSuggestions.slice(0, 5),
      };
    }

    const filtered = moduleSuggestions.filter((suggestion) =>
      normalizeText(suggestion).includes(normalizeText(query)),
    );

    return {
      recent: searchHistory
        .filter((item) => normalizeText(item).includes(normalizeText(query)))
        .slice(0, 3),
      suggestions: filtered.slice(0, 5),
    };
  };

  const { recent, suggestions } = getSuggestions();

  // Compact variant for mobile
  if (variant === 'compact') {
    return (
      <div className={cn('relative', className)}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            ref={inputRef}
            value={searchState.query}
            onChange={(e) => {
              handleInputChange(e.target.value);
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              'pl-9 pr-20',
              sizeClasses[size],
              isFocused && 'ring-2 ring-primary/20',
              className,
            )}
            autoFocus={autoFocus}
          />

          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {searchState.query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="w-6 h-6 p-0 hover:bg-gray-100"
              >
                <X className="w-3 h-3" />
              </Button>
            )}

            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {searchState.filters.length}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        {/* Search Icon */}
        <Search
          className={cn(
            'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400',
            size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5',
          )}
        />

        {/* Input */}
        <Input
          ref={inputRef}
          value={searchState.query}
          onChange={(e) => {
            handleInputChange(e.target.value);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={isMobile ? placeholder : `${placeholder} ${showShortcuts ? '⌘K' : ''}`}
          className={cn(
            'pl-10 pr-24 transition-all duration-200',
            sizeClasses[size],
            isFocused && 'ring-2 ring-primary/20 border-primary/40',
            searchState.isLoading && 'pr-28',
            className,
          )}
          autoFocus={autoFocus}
        />

        {/* Right side elements */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {/* Loading indicator */}
          {searchState.isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}

          {/* Clear button */}
          {searchState.query && !searchState.isLoading && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={handleClear}
              className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-gray-600" />
            </motion.button>
          )}

          {/* Filters indicator */}
          {hasActiveFilters && (
            <Badge
              variant="secondary"
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
              onClick={clearFilters}
            >
              <Filter className="w-3 h-3 mr-1" />
              {searchState.filters.length}
            </Badge>
          )}

          {/* Keyboard shortcut indicator */}
          {showShortcuts && !isMobile && !isFocused && (
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          )}
        </div>
      </div>

      {/* Search suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && (isFocused || searchState.query) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-80 overflow-hidden"
          >
            <div className="p-2">
              {/* Recent searches */}
              {recent.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between px-2 py-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <History className="w-3 h-3" />
                      <span>Son Aramalar</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="text-xs h-6 px-2 text-gray-400 hover:text-gray-600"
                    >
                      Temizle
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {recent.map((item, index) => (
                      <motion.button
                        key={`recent-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          handleSuggestionClick(item);
                        }}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2 transition-colors"
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{item}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Module suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-500 mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Önerilen Aramalar</span>
                  </div>
                  <div className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={`suggestion-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (recent.length + index) * 0.05 }}
                        onClick={() => {
                          handleSuggestionClick(suggestion);
                        }}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2 transition-colors"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{suggestion}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* No suggestions */}
              {recent.length === 0 && suggestions.length === 0 && searchState.query && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Öneri bulunamadı</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
