/**
 * @fileoverview VirtualList Component Tests
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VirtualList, BeneficiaryVirtualList } from '@/components/shared/VirtualList';

// Mock react-window
vi.mock('react-window', () => ({
  FixedSizeList: ({ children, height, itemCount, itemSize }: any) => (
    <div data-testid="virtual-list" style={{ height }}>
      <div>Item Count: {itemCount}</div>
      <div>Item Size: {itemSize}</div>
      {children({ index: 0, style: {} })}
    </div>
  )
}));

describe('VirtualList', () => {
  const mockItems = [
    { id: '1', name: 'Test Item 1' },
    { id: '2', name: 'Test Item 2' },
    { id: '3', name: 'Test Item 3' }
  ];

  const mockRenderItem = vi.fn(({ item, index }) => (
    <div key={item.id} data-testid={`item-${index}`}>
      {item.name}
    </div>
  ));

  it('renders virtual list with items', () => {
    render(
      <VirtualList
        items={mockItems}
        height={300}
        itemHeight={50}
        renderItem={mockRenderItem}
      />
    );

    expect(screen.getByTestId('virtual-list')).toBeInTheDocument();
    expect(screen.getByText('Item Count: 3')).toBeInTheDocument();
    expect(screen.getByText('Item Size: 50')).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    render(
      <VirtualList
        items={[]}
        height={300}
        itemHeight={50}
        renderItem={mockRenderItem}
        emptyMessage="No items found"
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <VirtualList
        items={mockItems}
        height={300}
        itemHeight={50}
        renderItem={mockRenderItem}
        loading={true}
      />
    );

    expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
  });
});

describe('BeneficiaryVirtualList', () => {
  const mockBeneficiaries = [
    {
      id: '1',
      name: 'Test Beneficiary',
      city: 'Istanbul',
      status: 'active'
    }
  ];

  const mockOnClick = vi.fn();

  it('renders beneficiary list', () => {
    render(
      <BeneficiaryVirtualList
        beneficiaries={mockBeneficiaries}
        height={300}
        onBeneficiaryClick={mockOnClick}
      />
    );

    expect(screen.getByTestId('virtual-list')).toBeInTheDocument();
  });
});
