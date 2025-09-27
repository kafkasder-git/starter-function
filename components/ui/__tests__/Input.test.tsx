import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../../../tests/utils';
import { Input } from '../Input';

describe('Input', () => {
  it('should render input element', () => {
    render(<Input placeholder="Enter text" />);

    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should handle text input', async () => {
    const user = userEvent.setup();

    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text');
    await user.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });

  it('should handle onChange events', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input onChange={handleChange} placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text');
    await user.type(input, 'test');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled input" />);

    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
  });

  it('should accept different input types', () => {
    const { rerender } = render(<Input type="text" />);

    let input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'text');

    rerender(<Input type="password" />);
    input = document.querySelector('input[type="password"]')!;
    expect(input).toHaveAttribute('type', 'password');

    rerender(<Input type="email" />);
    input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');

    rerender(<Input type="number" />);
    input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('should apply custom className', () => {
    render(<Input className="custom-input" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('should forward ref correctly', () => {
    const ref = { current: null };

    render(<Input ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('should handle focus and blur events', async () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    const user = userEvent.setup();

    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);

    const input = screen.getByRole('textbox');

    await user.click(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    await user.tab();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('should support controlled input', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(<Input value="initial" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('initial');

    await user.clear(input);
    await user.type(input, 'new value');

    expect(handleChange).toHaveBeenCalled();

    rerender(<Input value="updated" onChange={handleChange} />);
    expect(input).toHaveValue('updated');
  });

  it('should handle required attribute', () => {
    render(<Input required />);

    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('should handle readonly attribute', () => {
    render(<Input readOnly value="readonly text" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveValue('readonly text');
  });

  it('should handle maxLength attribute', async () => {
    const user = userEvent.setup();

    render(<Input maxLength={5} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '123456789');

    expect(input).toHaveValue('12345');
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();

    render(<Input />);

    const input = screen.getByRole('textbox');

    await user.click(input);
    expect(input).toHaveFocus();

    await user.keyboard('{Tab}');
    expect(input).not.toHaveFocus();
  });
});
