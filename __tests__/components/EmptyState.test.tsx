/**
 * @fileoverview EmptyState Component Tests
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmptyStateComponent, { EmptyStates } from '@/components/shared/EmptyState';

describe('EmptyStateComponent', () => {
  it('renders with basic props', () => {
    render(
      <EmptyStateComponent
        title="Test Title"
        description="Test Description"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders with action button', () => {
    const mockAction = vi.fn();
    
    render(
      <EmptyStateComponent
        title="Test Title"
        description="Test Description"
        action={{
          label: 'Test Action',
          onClick: mockAction
        }}
      />
    );

    const button = screen.getByText('Test Action');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('renders with secondary action', () => {
    const mockSecondaryAction = vi.fn();
    
    render(
      <EmptyStateComponent
        title="Test Title"
        description="Test Description"
        action={{
          label: 'Primary Action',
          onClick: vi.fn()
        }}
        secondaryAction={{
          label: 'Secondary Action',
          onClick: mockSecondaryAction
        }}
      />
    );

    const secondaryButton = screen.getByText('Secondary Action');
    expect(secondaryButton).toBeInTheDocument();
    
    fireEvent.click(secondaryButton);
    expect(mockSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it('renders with custom icon', () => {
    const customIcon = <div data-testid="custom-icon">Custom Icon</div>;
    
    render(
      <EmptyStateComponent
        title="Test Title"
        description="Test Description"
        icon={customIcon}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});

describe('EmptyStates', () => {
  it('renders Beneficiaries empty state', () => {
    const mockOnCreate = vi.fn();
    
    render(<EmptyStates.Beneficiaries onCreate={mockOnCreate} />);
    
    expect(screen.getByText('İhtiyaç Sahibi Bulunamadı')).toBeInTheDocument();
    expect(screen.getByText('İhtiyaç Sahibi Ekle')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('İhtiyaç Sahibi Ekle'));
    expect(mockOnCreate).toHaveBeenCalledTimes(1);
  });

  it('renders Donations empty state', () => {
    const mockOnCreate = vi.fn();
    
    render(<EmptyStates.Donations onCreate={mockOnCreate} />);
    
    expect(screen.getByText('Bağış Bulunamadı')).toBeInTheDocument();
    expect(screen.getByText('Bağış Kaydet')).toBeInTheDocument();
  });

  it('renders Messages empty state', () => {
    const mockOnNewMessage = vi.fn();
    
    render(<EmptyStates.Messages onNewMessage={mockOnNewMessage} />);
    
    expect(screen.getByText('Mesaj Bulunamadı')).toBeInTheDocument();
    expect(screen.getByText('Yeni Mesaj')).toBeInTheDocument();
  });

  it('renders Loading empty state', () => {
    render(<EmptyStates.Loading />);
    
    expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
  });
});
