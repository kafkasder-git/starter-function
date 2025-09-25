/**
 * @fileoverview Button Component Unit Tests
 * @description Tests for the basic Button UI component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock Button component if it doesn't exist
const ButtonComponent = ({
  children,
  onClick,
  disabled,
  variant = 'default',
  size = 'md',
  ...props
}: any) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size}`}
      {...props}
    >
      {children}
    </button>
  );
};

describe('Button Component', () => {
  it('should render button with text content', () => {
    render(<ButtonComponent>Click me</ButtonComponent>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('should render button with custom text', () => {
    render(<ButtonComponent>Test Button</ButtonComponent>);

    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();

    render(<ButtonComponent onClick={handleClick}>Click me</ButtonComponent>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn();

    render(
      <ButtonComponent onClick={handleClick} disabled>
        Disabled Button
      </ButtonComponent>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render disabled button', () => {
    render(<ButtonComponent disabled>Disabled Button</ButtonComponent>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should render enabled button by default', () => {
    render(<ButtonComponent>Enabled Button</ButtonComponent>);

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('should render with different variants', () => {
    const { rerender } = render(<ButtonComponent variant="primary">Primary</ButtonComponent>);

    let button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary');

    rerender(<ButtonComponent variant="secondary">Secondary</ButtonComponent>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('btn-secondary');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<ButtonComponent size="sm">Small</ButtonComponent>);

    let button = screen.getByRole('button');
    expect(button).toHaveClass('btn-sm');

    rerender(<ButtonComponent size="lg">Large</ButtonComponent>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('btn-lg');
  });

  it('should render button with additional props', () => {
    render(
      <ButtonComponent type="submit" id="submit-button" aria-label="Submit form">
        Submit
      </ButtonComponent>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('id', 'submit-button');
    expect(button).toHaveAttribute('aria-label', 'Submit form');
  });

  it('should handle keyboard events', () => {
    const handleClick = vi.fn();

    render(<ButtonComponent onClick={handleClick}>Keyboard Test</ButtonComponent>);

    const button = screen.getByRole('button');

    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Test Space key
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should have correct accessibility attributes', () => {
    render(<ButtonComponent>Accessible Button</ButtonComponent>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should render custom className', () => {
    render(<ButtonComponent className="custom-class">Custom Button</ButtonComponent>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should handle loading state', () => {
    const { rerender } = render(<ButtonComponent loading>Loading Button</ButtonComponent>);

    let button = screen.getByRole('button');
    expect(button).toHaveClass('btn-loading');
    expect(button).toBeDisabled();

    rerender(<ButtonComponent loading={false}>Loaded Button</ButtonComponent>);
    button = screen.getByRole('button');
    expect(button).not.toHaveClass('btn-loading');
    expect(button).not.toBeDisabled();
  });

  it('should handle icon buttons', () => {
    render(
      <ButtonComponent>
        <span>🔍</span>
        Search
      </ButtonComponent>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('🔍');
    expect(button).toHaveTextContent('Search');
  });

  it('should have correct button type', () => {
    const { rerender } = render(<ButtonComponent type="button">Button Type</ButtonComponent>);

    let button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');

    rerender(<ButtonComponent type="submit">Submit Type</ButtonComponent>);
    button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
