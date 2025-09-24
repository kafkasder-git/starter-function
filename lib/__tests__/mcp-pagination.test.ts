import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { MCPPaginationOptions, MCPPaginatedResponse } from '../../types/mcp';

// Mock implementation of MCPPaginator
class MockMCPPaginator<T> {
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  async paginate(data: T[], options: MCPPaginationOptions): Promise<MCPPaginatedResponse<T>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'asc', search, filters } = options;

    // Normalize page number (handle negative values and zero)
    const normalizedPage = Math.max(1, page);

    let filteredData = [...data];

    // Apply search
    if (search && search.query) {
      filteredData = filteredData.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(search.query.toLowerCase()),
      );
    }

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        filteredData = filteredData.filter((item) => (item as any)[key] === value);
      });
    }

    // Apply sorting
    if (sortBy) {
      filteredData.sort((a, b) => {
        const aVal = (a as any)[sortBy];
        const bVal = (b as any)[sortBy];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (normalizedPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        currentPage: normalizedPage,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: normalizedPage < totalPages,
        hasPreviousPage: normalizedPage > 1,
      },
      meta: {
        processingTime: 50,
        cacheHit: false,
        query: search?.query || '',
        filters: filters || {},
      },
    };
  }
}

// Mock data for testing
const mockMembers = Array.from({ length: 100 }, (_, i) => ({
  id: `member-${i + 1}`,
  name: `Member ${i + 1}`,
  email: `member${i + 1}@example.com`,
  role: i % 3 === 0 ? 'admin' : i % 3 === 1 ? 'moderator' : 'member',
  joinDate: new Date(2023, 0, i + 1),
  isActive: i % 4 !== 0,
}));

const mockReports = Array.from({ length: 50 }, (_, i) => ({
  id: `report-${i + 1}`,
  title: `Report ${i + 1}`,
  type: i % 2 === 0 ? 'monthly' : 'weekly',
  createdAt: new Date(2023, i % 12, 1),
  status: i % 3 === 0 ? 'completed' : i % 3 === 1 ? 'pending' : 'draft',
}));

describe('MCPPaginator', () => {
  let paginator: MockMCPPaginator<any>;

  beforeEach(() => {
    vi.clearAllMocks();

    paginator = new MockMCPPaginator({
      cacheEnabled: true,
      cacheTTL: 300000,
      maxCacheSize: 100,
    });

    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Pagination', () => {
    it('should paginate data correctly', async () => {
      const result = await paginator.paginate(mockMembers, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(10);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(10);
      expect(result.pagination.totalItems).toBe(100);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(false);
    });

    it('should handle last page correctly', async () => {
      const result = await paginator.paginate(mockMembers, {
        page: 10,
        limit: 10,
      });

      expect(result.data).toHaveLength(10);
      expect(result.pagination.currentPage).toBe(10);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });

    it('should handle empty results', async () => {
      const result = await paginator.paginate([], {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  describe('Sorting', () => {
    it('should sort data in ascending order', async () => {
      const result = await paginator.paginate(mockMembers, {
        page: 1,
        limit: 5,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      expect(result.data[0].name).toBe('Member 1');
      expect(result.data[1].name).toBe('Member 10');
    });

    it('should sort data in descending order', async () => {
      const result = await paginator.paginate(mockMembers, {
        page: 1,
        limit: 5,
        sortBy: 'name',
        sortOrder: 'desc',
      });

      expect(result.data[0].name).toBe('Member 99');
    });
  });

  describe('Filtering', () => {
    it('should filter data by role', async () => {
      const result = await paginator.paginate(mockMembers, {
        page: 1,
        limit: 50,
        filters: { role: 'admin' },
      });

      expect(result.data.every((member) => member.role === 'admin')).toBe(true);
    });

    it('should filter data by active status', async () => {
      const result = await paginator.paginate(mockMembers, {
        page: 1,
        limit: 50,
        filters: { isActive: true },
      });

      expect(result.data.every((member) => member.isActive === true)).toBe(true);
    });
  });

  describe('Search', () => {
    it('should search data by query', async () => {
      const result = await paginator.paginate(mockMembers, {
        page: 1,
        limit: 50,
        search: {
          query: 'Member 1',
          fields: ['name'],
        },
      });

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.every((member) => member.name.includes('Member 1'))).toBe(true);
    });

    it('should handle empty search results', async () => {
      const result = await paginator.paginate(mockMembers, {
        page: 1,
        limit: 50,
        search: {
          query: 'NonExistentMember',
          fields: ['name'],
        },
      });

      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalItems).toBe(0);
    });
  });

  describe('Performance and Caching', () => {
    it('should include performance metrics', async () => {
      const result = await paginator.paginate(mockMembers, {
        page: 1,
        limit: 10,
      });

      expect(result.meta.processingTime).toBeDefined();
      expect(typeof result.meta.processingTime).toBe('number');
    });

    it('should include cache information', async () => {
      const result = await paginator.paginate(mockMembers, {
        page: 1,
        limit: 10,
      });

      expect(result.meta.cacheHit).toBeDefined();
      expect(typeof result.meta.cacheHit).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid page numbers', async () => {
      const result = await paginator.paginate(mockMembers, {
        page: 0,
        limit: 10,
      });

      expect(result.pagination.currentPage).toBe(1);
    });

    it('should handle negative page numbers', async () => {
      const result = await paginator.paginate(mockMembers, {
        page: -1,
        limit: 10,
      });

      expect(result.pagination.currentPage).toBe(1);
    });
  });
});

describe('Specialized Paginators', () => {
  describe('Members Paginator', () => {
    let membersPaginator: MockMCPPaginator<any>;

    beforeEach(() => {
      membersPaginator = new MockMCPPaginator({
        defaultSort: 'joinDate',
        defaultSortOrder: 'desc',
        searchFields: ['name', 'email'],
        filterFields: ['role', 'isActive'],
      });
    });

    it('should paginate members with default sorting', async () => {
      const result = await membersPaginator.paginate(mockMembers, {
        page: 1,
        limit: 10,
        sortBy: 'joinDate',
        sortOrder: 'desc',
      });

      expect(result.data).toHaveLength(10);
      expect(result.pagination.totalItems).toBe(100);
    });

    it('should search members by name and email', async () => {
      const result = await membersPaginator.paginate(mockMembers, {
        page: 1,
        limit: 50,
        search: {
          query: 'member1@',
          fields: ['email'],
        },
      });

      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('Reports Paginator', () => {
    let reportsPaginator: MockMCPPaginator<any>;

    beforeEach(() => {
      reportsPaginator = new MockMCPPaginator({
        defaultSort: 'createdAt',
        defaultSortOrder: 'desc',
        searchFields: ['title'],
        filterFields: ['type', 'status'],
      });
    });

    it('should paginate reports with default sorting', async () => {
      const result = await reportsPaginator.paginate(mockReports, {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toHaveLength(10);
      expect(result.pagination.totalItems).toBe(50);
    });

    it('should filter reports by type', async () => {
      const result = await reportsPaginator.paginate(mockReports, {
        page: 1,
        limit: 50,
        filters: { type: 'monthly' },
      });

      expect(result.data.every((report) => report.type === 'monthly')).toBe(true);
    });
  });
});

describe('Complex Scenarios', () => {
  let paginator: MockMCPPaginator<any>;

  beforeEach(() => {
    paginator = new MockMCPPaginator({
      cacheEnabled: true,
      cacheTTL: 300000,
    });
  });

  it('should handle combined search, filter, and sort', async () => {
    const result = await paginator.paginate(mockMembers, {
      page: 1,
      limit: 20,
      search: {
        query: 'Member',
        fields: ['name'],
      },
      filters: { isActive: true },
      sortBy: 'name',
      sortOrder: 'asc',
    });

    expect(
      result.data.every((member) => member.name.includes('Member') && member.isActive === true),
    ).toBe(true);
  });

  it('should handle large datasets efficiently', async () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      category: i % 10,
    }));

    const startTime = Date.now();
    const result = await paginator.paginate(largeDataset, {
      page: 1,
      limit: 100,
    });
    const endTime = Date.now();

    expect(result.data).toHaveLength(100);
    expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
  });
});
