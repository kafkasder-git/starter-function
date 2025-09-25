/**
 * @fileoverview EnhancedSearchExperience Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, Clock, Star, TrendingUp, Filter, X, ArrowRight, Zap } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { cn } from '../ui/utils';

import { logger } from '../lib/logging/logger';
interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'page' | 'record' | 'action' | 'help';
  category: string;
  url?: string;
  icon?: React.ReactNode;
  relevance: number;
  metadata?: Record<string, any>;
  onSelect?: () => void;
}

interface SearchSuggestion {
  id: string;
  query: string;
  category: 'recent' | 'popular' | 'suggestion';
  count?: number;
}

interface EnhancedSearchExperienceProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onNavigate?: (url: string) => void;
  className?: string;
  showSuggestions?: boolean;
  showFilters?: boolean;
}

// Gelişmiş mock data - gerçek veri yapısına daha yakın
const mockData = {
  beneficiaries: [
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      surname: 'Yılmaz',
      status: 'active',
      category: 'Gıda Yardımı',
      city: 'İstanbul',
      phone: '0532 123 45 67',
    },
    {
      id: 2,
      name: 'Ayşe',
      surname: 'Kara',
      status: 'pending',
      category: 'Eğitim Bursu',
      city: 'Ankara',
      phone: '0533 234 56 78',
    },
    {
      id: 3,
      name: 'Mehmet',
      surname: 'Özkan',
      status: 'active',
      category: 'Sağlık Yardımı',
      city: 'İzmir',
      phone: '0534 345 67 89',
    },
    {
      id: 4,
      name: 'Fatma',
      surname: 'Demir',
      status: 'active',
      category: 'Barınma Yardımı',
      city: 'Bursa',
      phone: '0535 456 78 90',
    },
    {
      id: 5,
      name: 'Ali',
      surname: 'Kaya',
      status: 'suspended',
      category: 'Gıda Yardımı',
      city: 'Antalya',
      phone: '0536 567 89 01',
    },
  ],
  donations: [
    {
      id: 1,
      donor: 'ABC Şirketi',
      amount: 5000,
      type: 'Kurumsal',
      date: '2024-01-15',
      category: 'Gıda Yardımı',
    },
    {
      id: 2,
      donor: 'Ali Veli',
      amount: 500,
      type: 'Bireysel',
      date: '2024-01-14',
      category: 'Eğitim Bursu',
    },
    {
      id: 3,
      donor: 'XYZ Derneği',
      amount: 2000,
      type: 'Kurum',
      date: '2024-01-13',
      category: 'Sağlık Yardımı',
    },
    {
      id: 4,
      donor: 'Mehmet Yılmaz',
      amount: 1000,
      type: 'Bireysel',
      date: '2024-01-12',
      category: 'Barınma Yardımı',
    },
    {
      id: 5,
      donor: 'DEF Holding',
      amount: 10000,
      type: 'Kurumsal',
      date: '2024-01-11',
      category: 'Genel Yardım',
    },
  ],
  members: [
    {
      id: 1,
      name: 'Fatma',
      surname: 'Yıldız',
      role: 'Yönetici',
      status: 'active',
      department: 'Yönetim',
      joinDate: '2023-01-01',
    },
    {
      id: 2,
      name: 'Can',
      surname: 'Demir',
      role: 'Üye',
      status: 'active',
      department: 'Gönüllü',
      joinDate: '2023-06-15',
    },
    {
      id: 3,
      name: 'Zehra',
      surname: 'Ak',
      role: 'Gönüllü',
      status: 'inactive',
      department: 'Saha',
      joinDate: '2023-03-20',
    },
    {
      id: 4,
      name: 'Osman',
      surname: 'Çelik',
      role: 'Muhasebeci',
      status: 'active',
      department: 'Mali İşler',
      joinDate: '2023-09-10',
    },
    {
      id: 5,
      name: 'Elif',
      surname: 'Öztürk',
      role: 'Sosyal Hizmetler',
      status: 'active',
      department: 'Sosyal',
      joinDate: '2023-11-05',
    },
  ],
  events: [
    { id: 1, title: 'Gıda Dağıtımı', date: '2024-01-20', location: 'Merkez Ofis', type: 'Yardım' },
    {
      id: 2,
      title: 'Yönetim Kurulu Toplantısı',
      date: '2024-01-25',
      location: 'Toplantı Salonu',
      type: 'Toplantı',
    },
    {
      id: 3,
      title: 'Gönüllü Eğitimi',
      date: '2024-02-01',
      location: 'Eğitim Merkezi',
      type: 'Eğitim',
    },
  ],
};

/**
 * EnhancedSearchExperience function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function EnhancedSearchExperience({
  placeholder = 'Ne aramıştınız? (⌘K ile hızlı arama)',
  onSearch,
  onNavigate,
  className,
  showSuggestions = true,
  showFilters = true,
}: EnhancedSearchExperienceProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchSuggestion[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load search history
  useEffect(() => {
    try {
      const saved = localStorage.getItem('search-history');
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (error) {
      logger.warn('Error loading search history:', error);
    }
  }, []);

  // Save to search history
  const saveToHistory = useCallback(
    (query: string) => {
      if (query.trim().length < 2) return;

      const newHistory = [
        { id: Date.now().toString(), query: query.trim(), category: 'recent' as const },
        ...searchHistory.filter((item) => item.query !== query.trim()).slice(0, 9),
      ];

      setSearchHistory(newHistory);
      try {
        localStorage.setItem('search-history', JSON.stringify(newHistory));
      } catch (error) {
        logger.warn('Error saving search history:', error);
      }
    },
    [searchHistory],
  );

  // Advanced search logic with fuzzy matching
  const searchResults = useMemo((): SearchResult[] => {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search in pages/navigation
    const pages = [
      {
        id: 'beneficiaries',
        title: 'İhtiyaç Sahipleri',
        description: 'Yardım alan kişileri yönet',
        url: '/yardim/ihtiyac-sahipleri',
      },
      {
        id: 'donations',
        title: 'Bağışlar',
        description: 'Gelen bağışları takip et',
        url: '/bagis/liste',
      },
      {
        id: 'members',
        title: 'Üye Yönetimi',
        description: 'Dernek üyelerini yönet',
        url: '/uye/liste',
      },
      {
        id: 'finance',
        title: 'Mali İşler',
        description: 'Gelir-gider takibi',
        url: '/fon/gelir-gider',
      },
      {
        id: 'events',
        title: 'Etkinlikler',
        description: 'Dernek etkinlikleri',
        url: '/is/etkinlikler',
      },
    ];

    pages.forEach((page) => {
      const titleMatch = page.title.toLowerCase().includes(queryLower);
      const descMatch = page.description.toLowerCase().includes(queryLower);

      if (titleMatch ?? descMatch) {
        results.push({
          id: `page-${page.id}`,
          title: page.title,
          description: page.description,
          type: 'page',
          category: 'Sayfa',
          url: page.url,
          relevance: titleMatch ? 10 : 5,
          onSelect: () => onNavigate?.(page.url),
        });
      }
    });

    // Search in records
    if (activeFilters.length === 0 ?? activeFilters.includes('records')) {
      // Search beneficiaries - gelişmiş arama
      mockData.beneficiaries.forEach((person) => {
        const fullName = `${person.name} ${person.surname}`.toLowerCase();
        const nameMatch =
          fullName.includes(queryLower) || person.name.toLowerCase().includes(queryLower);
        const cityMatch = person.city?.toLowerCase().includes(queryLower);
        const categoryMatch = person.category?.toLowerCase().includes(queryLower);
        const phoneMatch = person.phone?.includes(query);

        if (nameMatch ?? cityMatch || categoryMatch ?? phoneMatch) {
          const relevance = nameMatch ? 10 : cityMatch ? 8 : categoryMatch ? 7 : 6;
          results.push({
            id: `beneficiary-${person.id}`,
            title: `${person.name} ${person.surname}`,
            description: `${person.category} - ${person.city} - ${person.phone}`,
            type: 'record',
            category: 'İhtiyaç Sahibi',
            relevance,
            metadata: {
              status: person.status,
              category: person.category,
              city: person.city,
              phone: person.phone,
            },
          });
        }
      });

      // Search donations - gelişmiş arama
      mockData.donations.forEach((donation) => {
        const donorMatch = donation.donor.toLowerCase().includes(queryLower);
        const amountMatch = donation.amount.toString().includes(query);
        const categoryMatch = donation.category?.toLowerCase().includes(queryLower);
        const typeMatch = donation.type?.toLowerCase().includes(queryLower);

        if (donorMatch ?? amountMatch || categoryMatch ?? typeMatch) {
          const relevance = donorMatch ? 10 : amountMatch ? 9 : categoryMatch ? 8 : 7;
          results.push({
            id: `donation-${donation.id}`,
            title: donation.donor,
            description: `${donation.amount.toLocaleString('tr-TR')}₺ - ${donation.type} bağış - ${donation.date}`,
            type: 'record',
            category: 'Bağış',
            relevance,
            metadata: {
              amount: donation.amount,
              type: donation.type,
              date: donation.date,
              category: donation.category,
            },
          });
        }
      });

      // Search members - gelişmiş arama
      mockData.members.forEach((member) => {
        const fullName = `${member.name} ${member.surname}`.toLowerCase();
        const nameMatch =
          fullName.includes(queryLower) || member.name.toLowerCase().includes(queryLower);
        const roleMatch = member.role?.toLowerCase().includes(queryLower);
        const departmentMatch = member.department?.toLowerCase().includes(queryLower);

        if (nameMatch ?? roleMatch || departmentMatch) {
          const relevance = nameMatch ? 10 : roleMatch ? 8 : 7;
          results.push({
            id: `member-${member.id}`,
            title: `${member.name} ${member.surname}`,
            description: `${member.role} - ${member.department} - ${member.status === 'active' ? 'Aktif' : 'Pasif'}`,
            type: 'record',
            category: 'Üye',
            relevance,
            metadata: {
              role: member.role,
              status: member.status,
              department: member.department,
              joinDate: member.joinDate,
            },
          });
        }
      });

      // Search events - yeni özellik
      mockData.events.forEach((event) => {
        const titleMatch = event.title.toLowerCase().includes(queryLower);
        const locationMatch = event.location?.toLowerCase().includes(queryLower);
        const typeMatch = event.type?.toLowerCase().includes(queryLower);

        if (titleMatch ?? locationMatch || typeMatch) {
          const relevance = titleMatch ? 9 : locationMatch ? 7 : 6;
          results.push({
            id: `event-${event.id}`,
            title: event.title,
            description: `${event.type} - ${event.location} - ${event.date}`,
            type: 'record',
            category: 'Etkinlik',
            relevance,
            metadata: {
              type: event.type,
              location: event.location,
              date: event.date,
            },
          });
        }
      });
    }

    // Search in quick actions
    if (activeFilters.length === 0 ?? activeFilters.includes('actions')) {
      const actions = [
        {
          id: 'new-beneficiary',
          title: 'Yeni İhtiyaç Sahibi Ekle',
          description: 'Hızlı başvuru kaydı',
        },
        { id: 'record-donation', title: 'Bağış Kaydı', description: 'Yeni bağış girişi' },
        { id: 'new-member', title: 'Üye Kaydı', description: 'Yeni üye ekle' },
        { id: 'expense-entry', title: 'Gider Girişi', description: 'Mali gider kaydı' },
      ];

      actions.forEach((action) => {
        if (
          action.title.toLowerCase().includes(queryLower) ||
          action.description.toLowerCase().includes(queryLower)
        ) {
          results.push({
            id: `action-${action.id}`,
            title: action.title,
            description: action.description,
            type: 'action',
            category: 'Hızlı İşlem',
            relevance: 7,
            icon: <Zap className="w-4 h-4" />,
          });
        }
      });
    }

    // Akıllı arama önerileri - gelişmiş
    const suggestions = [
      'aktif yardım alan',
      'bekleyen başvuru',
      'bu ay bağış',
      'yeni üye',
      'mali rapor',
      'istanbul yardım',
      'eğitim bursu',
      'gıda dağıtımı',
      'toplantı',
      'gönüllü',
    ];

    suggestions.forEach((suggestion, index) => {
      if (suggestion.toLowerCase().includes(queryLower)) {
        results.push({
          id: `suggestion-${index}`,
          title: `"${suggestion}" için arama yap`,
          description: 'Akıllı arama önerisi',
          type: 'help',
          category: 'Öneri',
          relevance: 3,
          onSelect: () => {
            setQuery(suggestion);
          },
        });
      }
    });

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  }, [query, activeFilters, onNavigate]);

  // Popüler aramalar - gelişmiş
  const popularSearches = [
    { id: '1', query: 'aktif yardım alan', category: 'popular' as const, count: 15 },
    { id: '2', query: 'bu ay bağış', category: 'popular' as const, count: 12 },
    { id: '3', query: 'bekleyen başvuru', category: 'popular' as const, count: 8 },
    { id: '4', query: 'yeni üye', category: 'popular' as const, count: 6 },
    { id: '5', query: 'istanbul yardım', category: 'popular' as const, count: 5 },
    { id: '6', query: 'eğitim bursu', category: 'popular' as const, count: 4 },
    { id: '7', query: 'gıda dağıtımı', category: 'popular' as const, count: 3 },
  ];

  const suggestions = useMemo(() => {
    if (query.trim()) return [];
    return [...searchHistory.slice(0, 3), ...popularSearches.slice(0, 2)];
  }, [query, searchHistory]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const totalResults = searchResults.length + (query ? 0 : suggestions.length);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < totalResults - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalResults - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (query && searchResults[selectedIndex]) {
            searchResults[selectedIndex].onSelect?.();
            saveToHistory(query);
            setIsOpen(false);
          } else if (!query && suggestions[selectedIndex]) {
            setQuery(suggestions[selectedIndex].query);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, searchResults, suggestions, selectedIndex, query, saveToHistory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(0);
    onSearch?.(e.target.value);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setSelectedIndex(0);
  };

  const handleInputBlur = () => {
    // Delay closing to allow for clicks on results
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter],
    );
  };

  const clearFilters = () => {
    setActiveFilters([]);
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'page':
        return <ArrowRight className="w-4 h-4" />;
      case 'record':
        return <Search className="w-4 h-4" />;
      case 'action':
        return <Zap className="w-4 h-4" />;
      case 'help':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getSuggestionIcon = (category: SearchSuggestion['category']) => {
    switch (category) {
      case 'recent':
        return <Clock className="w-4 h-4" />;
      case 'popular':
        return <TrendingUp className="w-4 h-4" />;
      case 'suggestion':
        return <Star className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="pl-10 pr-4 h-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setSelectedIndex(0);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (activeFilters.length > 0 ?? isOpen) && (
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toggleFilter('records');
            }}
            className={cn(
              'h-7 px-3 text-xs',
              activeFilters.includes('records') && 'bg-primary text-primary-foreground',
            )}
          >
            <Filter className="w-3 h-3 mr-1" />
            Kayıtlar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toggleFilter('actions');
            }}
            className={cn(
              'h-7 px-3 text-xs',
              activeFilters.includes('actions') && 'bg-primary text-primary-foreground',
            )}
          >
            <Zap className="w-3 h-3 mr-1" />
            İşlemler
          </Button>
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2 text-xs text-muted-foreground"
            >
              <X className="w-3 h-3 mr-1" />
              Temizle
            </Button>
          )}
        </div>
      )}

      {/* Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-hidden">
          <CardContent className="p-0">
            <div ref={resultsRef} className="max-h-96 overflow-y-auto">
              {query ? (
                // Search Results
                searchResults.length > 0 ? (
                  <div className="p-2">
                    <div className="text-xs text-muted-foreground px-2 py-1 mb-2">
                      {searchResults.length} sonuç bulundu
                    </div>
                    {searchResults.map((result, index) => (
                      <button
                        key={result.id}
                        onClick={() => {
                          result.onSelect?.();
                          saveToHistory(query);
                          setIsOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
                          'hover:bg-accent hover:text-accent-foreground',
                          index === selectedIndex && 'bg-accent text-accent-foreground',
                        )}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center">
                          {result.icon ?? getTypeIcon(result.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{result.title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {result.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.description}
                          </p>
                        </div>

                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Search className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">"{query}" için sonuç bulunamadı</p>
                  </div>
                )
              ) : (
                // Suggestions
                showSuggestions &&
                suggestions.length > 0 && (
                  <div className="p-2">
                    <div className="text-xs text-muted-foreground px-2 py-1 mb-2">Öneriler</div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.id}
                        onClick={() => {
                          setQuery(suggestion.query);
                          inputRef.current?.focus();
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
                          'hover:bg-accent hover:text-accent-foreground',
                          index === selectedIndex && 'bg-accent text-accent-foreground',
                        )}
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-md bg-muted/30 flex items-center justify-center">
                          {getSuggestionIcon(suggestion.category)}
                        </div>

                        <div className="flex-1">
                          <span className="text-sm">{suggestion.query}</span>
                        </div>

                        {suggestion.count && (
                          <Badge variant="outline" className="text-xs">
                            {suggestion.count}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EnhancedSearchExperience;
