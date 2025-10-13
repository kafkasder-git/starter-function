/**
 * @fileoverview Input Enhancements Tests
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, FloatingLabelInput, InputGroup, InputAddon } from '../input';
import { Mail } from 'lucide-react';

describe('Input Enhancements', () => {
  describe('Warning State', () => {
    it('should render warning state correctly', () => {
      render(<Input placeholder="Test input" warning warningText="This is a warning" />);

      expect(screen.getByText('This is a warning')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('This is a warning');
    });

    it('should prioritize error over warning', () => {
      render(
        <Input
          placeholder="Test input"
          error
          errorText="This is an error"
          warning
          warningText="This is a warning"
        />
      );

      expect(screen.getByText('This is an error')).toBeInTheDocument();
      expect(screen.queryByText('This is a warning')).not.toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render small size input', () => {
      const { container } = render(<Input inputSize="sm" placeholder="Small input" />);

      const input = container.querySelector('input');
      expect(input).toHaveClass('h-8');
    });

    it('should render medium size input (default)', () => {
      const { container } = render(<Input placeholder="Medium input" />);

      const input = container.querySelector('input');
      expect(input).toHaveClass('h-10');
    });

    it('should render large size input', () => {
      const { container } = render(<Input inputSize="lg" placeholder="Large input" />);

      const input = container.querySelector('input');
      expect(input).toHaveClass('h-12');
    });
  });

  describe('FloatingLabelInput', () => {
    it('should render with label', () => {
      render(<FloatingLabelInput label="Email Address" />);

      expect(screen.getByText('Email Address')).toBeInTheDocument();
    });

    it('should show required indicator', () => {
      render(<FloatingLabelInput label="Email" required />);

      const label = screen.getByText(/Email/);
      expect(label.textContent).toContain('*');
    });

    it('should float label on focus', () => {
      render(<FloatingLabelInput label="Email" />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      // Label should have floating classes when focused
      const label = screen.getByText('Email');
      expect(label).toHaveClass('text-ring');
    });

    it('should float label when has value', () => {
      render(<FloatingLabelInput label="Email" value="test@example.com" />);

      // Label should be in floating position
      const label = screen.getByText('Email');
      expect(label).toBeInTheDocument();
    });

    it('should support different sizes', () => {
      const { container } = render(<FloatingLabelInput label="Email" inputSize="lg" />);

      const input = container.querySelector('input');
      expect(input).toHaveClass('h-12');
    });

    it('should show error state', () => {
      render(<FloatingLabelInput label="Email" error errorText="Invalid email" />);

      expect(screen.getByText('Invalid email')).toBeInTheDocument();
      const label = screen.getByText('Email');
      expect(label).toHaveClass('text-destructive');
    });
  });

  describe('InputGroup', () => {
    it('should render input with addons', () => {
      render(
        <InputGroup>
          <InputAddon>https://</InputAddon>
          <Input placeholder="example.com" />
          <InputAddon>.com</InputAddon>
        </InputGroup>
      );

      expect(screen.getByText('https://')).toBeInTheDocument();
      expect(screen.getByText('.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('example.com')).toBeInTheDocument();
    });

    it('should support different sizes', () => {
      const { container } = render(
        <InputGroup inputSize="sm">
          <InputAddon>@</InputAddon>
          <Input placeholder="username" />
        </InputGroup>
      );

      const input = container.querySelector('input');
      expect(input).toHaveClass('h-8');
    });

    it('should render addon with icon', () => {
      render(
        <InputGroup>
          <InputAddon>
            <Mail data-testid="mail-icon" />
          </InputAddon>
          <Input placeholder="email" />
        </InputGroup>
      );

      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    });
  });

  describe('Combined Features', () => {
    it('should support size with warning state', () => {
      const { container } = render(
        <Input inputSize="lg" warning warningText="Warning message" placeholder="Test" />
      );

      const input = container.querySelector('input');
      expect(input).toHaveClass('h-12');
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });

    it('should support floating label with size variants', () => {
      const { container } = render(
        <FloatingLabelInput label="Email" inputSize="sm" warning warningText="Check your email" />
      );

      const input = container.querySelector('input');
      expect(input).toHaveClass('h-8');
      expect(screen.getByText('Check your email')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria attributes for warning', () => {
      render(<Input placeholder="Test" warning warningText="Warning message" />);

      const input = screen.getByPlaceholderText('Test');
      expect(input).toHaveAttribute('aria-describedby', 'warning-text');
    });

    it('should have proper aria attributes for floating label', () => {
      render(<FloatingLabelInput label="Email" required />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-labelledby');
    });

    it('should have proper role for input group', () => {
      const { container } = render(
        <InputGroup>
          <InputAddon>@</InputAddon>
          <Input placeholder="username" />
        </InputGroup>
      );

      const group = container.querySelector('[role="group"]');
      expect(group).toBeInTheDocument();
    });
  });
});
