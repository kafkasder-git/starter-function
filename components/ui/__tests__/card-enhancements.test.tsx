/**
 * @fileoverview Card Enhancement Tests
 * Tests for new card features: status indicators, skeleton, compact variant, and badges
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent, CardSkeleton } from '../card';

describe('Card Enhancements', () => {
  describe('Status Indicators', () => {
    it('renders success status indicator', () => {
      const { container } = render(
        <Card status="success">
          <CardContent>Success content</CardContent>
        </Card>
      );
      const card = container.querySelector('[data-slot="card"]');
      expect(card?.className).toContain('border-l-4');
      expect(card?.className).toContain('border-l-green-500');
    });

    it('renders warning status indicator', () => {
      const { container } = render(
        <Card status="warning">
          <CardContent>Warning content</CardContent>
        </Card>
      );
      const card = container.querySelector('[data-slot="card"]');
      expect(card?.className).toContain('border-l-4');
      expect(card?.className).toContain('border-l-yellow-500');
    });

    it('renders error status indicator', () => {
      const { container } = render(
        <Card status="error">
          <CardContent>Error content</CardContent>
        </Card>
      );
      const card = container.querySelector('[data-slot="card"]');
      expect(card?.className).toContain('border-l-4');
      expect(card?.className).toContain('border-l-red-500');
    });

    it('renders info status indicator', () => {
      const { container } = render(
        <Card status="info">
          <CardContent>Info content</CardContent>
        </Card>
      );
      const card = container.querySelector('[data-slot="card"]');
      expect(card?.className).toContain('border-l-4');
      expect(card?.className).toContain('border-l-blue-500');
    });

    it('renders without status indicator by default', () => {
      const { container } = render(
        <Card>
          <CardContent>Default content</CardContent>
        </Card>
      );
      const card = container.querySelector('[data-slot="card"]');
      expect(card?.className).not.toContain('border-l-4');
    });
  });

  describe('CardSkeleton', () => {
    it('renders skeleton when skeleton prop is true', () => {
      const { container } = render(<Card skeleton={true} />);
      const skeleton = container.querySelector('[data-slot="card-skeleton"]');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton?.className).toContain('animate-pulse');
    });

    it('renders CardSkeleton component directly', () => {
      const { container } = render(<CardSkeleton />);
      const skeleton = container.querySelector('[data-slot="card-skeleton"]');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton?.className).toContain('animate-pulse');
    });

    it('renders skeleton with header by default', () => {
      const { container } = render(<CardSkeleton />);
      const skeletonBars = container.querySelectorAll('.bg-muted');
      expect(skeletonBars.length).toBeGreaterThan(0);
    });

    it('renders skeleton without header when showHeader is false', () => {
      const { container } = render(<CardSkeleton showHeader={false} />);
      const skeleton = container.querySelector('[data-slot="card-skeleton"]');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders skeleton with footer when showFooter is true', () => {
      const { container } = render(<CardSkeleton showFooter={true} />);
      const skeleton = container.querySelector('[data-slot="card-skeleton"]');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders custom number of content lines', () => {
      const { container } = render(<CardSkeleton contentLines={5} showHeader={false} />);
      const contentLines = container.querySelectorAll('.bg-muted');
      expect(contentLines.length).toBe(5);
    });
  });

  describe('Compact Variant', () => {
    it('renders compact variant with reduced padding', () => {
      const { container } = render(
        <Card variant="compact">
          <CardContent>Compact content</CardContent>
        </Card>
      );
      const card = container.querySelector('[data-slot="card"]');
      expect(card?.className).toContain('gap-3');
      expect(card?.className).toContain('p-4');
    });

    it('renders default variant with normal padding', () => {
      const { container } = render(
        <Card variant="default">
          <CardContent>Default content</CardContent>
        </Card>
      );
      const card = container.querySelector('[data-slot="card"]');
      expect(card?.className).toContain('gap-6');
      expect(card?.className).not.toContain('p-4');
    });
  });

  describe('Badge Support', () => {
    it('renders badge with number', () => {
      render(
        <Card badge={5}>
          <CardContent>Content with badge</CardContent>
        </Card>
      );
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders badge with string', () => {
      render(
        <Card badge="New">
          <CardContent>Content with badge</CardContent>
        </Card>
      );
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('does not render badge when badge prop is undefined', () => {
      const { container } = render(
        <Card>
          <CardContent>Content without badge</CardContent>
        </Card>
      );
      const badge = container.querySelector('.absolute.-top-2.-right-2');
      expect(badge).not.toBeInTheDocument();
    });

    it('renders badge with zero value', () => {
      render(
        <Card badge={0}>
          <CardContent>Content with zero badge</CardContent>
        </Card>
      );
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Combined Features', () => {
    it('renders card with status and badge', () => {
      const { container } = render(
        <Card status="success" badge={3}>
          <CardHeader>
            <CardTitle>Success Card</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );
      const card = container.querySelector('[data-slot="card"]');
      expect(card?.className).toContain('border-l-green-500');
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders compact card with status indicator', () => {
      const { container } = render(
        <Card variant="compact" status="warning">
          <CardContent>Compact warning</CardContent>
        </Card>
      );
      const card = container.querySelector('[data-slot="card"]');
      expect(card?.className).toContain('gap-3');
      expect(card?.className).toContain('border-l-yellow-500');
    });

    it('renders compact skeleton', () => {
      const { container } = render(<CardSkeleton variant="compact" />);
      const skeleton = container.querySelector('[data-slot="card-skeleton"]');
      expect(skeleton?.className).toContain('gap-3');
      expect(skeleton?.className).toContain('p-4');
    });
  });
});
