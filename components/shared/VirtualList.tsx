/**
 * @fileoverview VirtualList Component - Performance optimized list rendering
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (props: {
    index: number;
    style: React.CSSProperties;
    item: T;
  }) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  onItemsRendered?: (props: {
    visibleStartIndex: number;
    visibleStopIndex: number;
  }) => void;
}

/**
 * Virtual scrolling list component for performance optimization
 * Büyük listelerde performans için windowing kullanır
 */
function VirtualListComponent<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className,
  emptyMessage = 'Veri bulunamadı',
  loading = false,
  onItemsRendered,
}: VirtualListProps<T>) {
  // Memoized item renderer
  const ItemRenderer = memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    
    if (!item) {
      return (
        <div style={style} className="flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 h-4 w-full rounded" />
        </div>
      );
    }

    return (
      <div style={style}>
        {renderItem({ index, style, item })}
      </div>
    );
  });

  ItemRenderer.displayName = 'VirtualListItem';

  // Empty state
  const emptyState = useMemo(() => (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <div className="text-6xl mb-4">📋</div>
      <h3 className="text-lg font-medium mb-2">Veri Bulunamadı</h3>
      <p className="text-sm text-gray-400">{emptyMessage}</p>
    </div>
  ), [emptyMessage]);

  // Loading state
  const loadingState = useMemo(() => (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
      <p className="text-gray-600">Yükleniyor...</p>
    </div>
  ), []);

  // Show loading state
  if (loading) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        {loadingState}
      </div>
    );
  }

  // Show empty state
  if (items.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        {emptyState}
      </div>
    );
  }

  return (
    <div className={cn('virtual-list-container', className)}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        onItemsRendered={onItemsRendered}
        overscanCount={5} // Render 5 extra items for smooth scrolling
      >
        {ItemRenderer}
      </List>
    </div>
  );
}

// Generic type export
export const VirtualList = memo(VirtualListComponent) as <T>(
  props: VirtualListProps<T>
) => JSX.Element;

VirtualList.displayName = 'VirtualList';

// Specific implementations for common use cases

interface BeneficiaryVirtualListProps {
  beneficiaries: {
    id: string;
    name: string;
    city: string;
    status: string;
  }[];
  height: number;
  onBeneficiaryClick: (id: string) => void;
}

export const BeneficiaryVirtualList = memo(({
  beneficiaries,
  height,
  onBeneficiaryClick,
}: BeneficiaryVirtualListProps) => {
  return (
    <VirtualList
      items={beneficiaries}
      height={height}
      itemHeight={80}
      renderItem={({ item, index }) => (
        <div
          key={item.id}
          className="flex items-center p-4 border-b hover:bg-gray-50 cursor-pointer"
          onClick={() => { onBeneficiaryClick(item.id); }}
        >
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{item.name}</h4>
            <p className="text-sm text-gray-500">{item.city}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={cn(
              'px-2 py-1 text-xs rounded-full',
              item.status === 'active' ? 'bg-green-100 text-green-800' :
              item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            )}>
              {item.status}
            </span>
          </div>
        </div>
      )}
      emptyMessage="İhtiyaç sahibi bulunamadı"
    />
  );
});

interface DonationVirtualListProps {
  donations: {
    id: string;
    amount: number;
    donor: string;
    date: string;
    status: string;
  }[];
  height: number;
  onDonationClick: (id: string) => void;
}

export const DonationVirtualList = memo(({
  donations,
  height,
  onDonationClick,
}: DonationVirtualListProps) => {
  return (
    <VirtualList
      items={donations}
      height={height}
      itemHeight={70}
      renderItem={({ item }) => (
        <div
          key={item.id}
          className="flex items-center p-4 border-b hover:bg-gray-50 cursor-pointer"
          onClick={() => { onDonationClick(item.id); }}
        >
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{item.donor}</h4>
            <p className="text-sm text-gray-500">{item.date}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-green-600">
              {item.amount.toLocaleString('tr-TR')} ₺
            </span>
            <span className={cn(
              'px-2 py-1 text-xs rounded-full',
              item.status === 'approved' ? 'bg-green-100 text-green-800' :
              item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            )}>
              {item.status}
            </span>
          </div>
        </div>
      )}
      emptyMessage="Bağış bulunamadı"
    />
  );
});

// Hook for virtual list performance monitoring
export function useVirtualListPerformance() {
  const handleItemsRendered = useMemo(() => {
    return ({ visibleStartIndex, visibleStopIndex }: { visibleStartIndex: number; visibleStopIndex: number }) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`VirtualList: Rendering items ${visibleStartIndex} to ${visibleStopIndex}`);
      }
    };
  }, []);

  return { handleItemsRendered };
}

export default VirtualList;
