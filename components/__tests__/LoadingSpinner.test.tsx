import { describe, it, expect } from 'vitest';
import { render } from '../../tests/utils';
import { LoadingSpinner, PageLoading } from '../shared/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render loading spinner', () => {
    render(<LoadingSpinner />);

    // Should render spinner element with animate-spin class
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('text-blue-600');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);

    let spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-4', 'h-4');

    rerender(<LoadingSpinner size="md" />);
    spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-6', 'h-6');

    rerender(<LoadingSpinner size="lg" />);
    spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('should apply custom className', () => {
    render(<LoadingSpinner className="custom-class" />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('custom-class');
  });

  it('should render with default medium size', () => {
    render(<LoadingSpinner />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-6', 'h-6');
  });
});

describe('PageLoading', () => {
  it('should render page loading component', () => {
    render(<PageLoading />);

    // Should render the loading container
    const container = document.querySelector('.min-h-\\[400px\\]');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('should display loading text', () => {
    const { container } = render(<PageLoading />);

    expect(container.textContent).toContain('Yükleniyor...');
    expect(container.textContent).toContain('Lütfen bekleyiniz');
  });

  it('should render heart icon', () => {
    render(<PageLoading />);

    // Heart icon should be present (Lucide renders as SVG)
    const heartIcon = document.querySelector('.lucide-heart');
    expect(heartIcon).toBeInTheDocument();
  });

  it('should render spinning loader', () => {
    render(<PageLoading />);

    // Should have animate-spin class
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});
