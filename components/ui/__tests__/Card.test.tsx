import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../src/test/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card container', () => {
      render(<Card data-testid="card">Card content</Card>);

      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass(
        'bg-card',
        'text-card-foreground',
        'flex',
        'flex-col',
        'gap-6',
        'rounded-xl',
        'border',
      );
      expect(card).toHaveAttribute('data-slot', 'card');
    });

    it('should apply custom className', () => {
      render(
        <Card className="custom-card" data-testid="card">
          Card content
        </Card>,
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-card');
    });

    it('should render as div element', () => {
      render(<Card data-testid="card">Card content</Card>);

      const card = screen.getByTestId('card');
      expect(card.tagName).toBe('DIV');
    });
  });

  describe('CardHeader', () => {
    it('should render card header', () => {
      render(<CardHeader data-testid="card-header">Header content</CardHeader>);

      const header = screen.getByTestId('card-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute('data-slot', 'card-header');
      expect(header).toHaveClass('grid', 'auto-rows-min', 'items-start', 'gap-1.5', 'px-6', 'pt-6');
    });

    it('should apply custom className', () => {
      render(
        <CardHeader className="custom-header" data-testid="card-header">
          Header content
        </CardHeader>,
      );

      const header = screen.getByTestId('card-header');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('CardTitle', () => {
    it('should render card title as h4 by default', () => {
      render(<CardTitle>Card Title</CardTitle>);

      const title = screen.getByRole('heading', { level: 4 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Card Title');
      expect(title).toHaveClass('leading-none');
      expect(title).toHaveAttribute('data-slot', 'card-title');
    });

    it('should apply custom className', () => {
      render(<CardTitle className="custom-title">Card Title</CardTitle>);

      const title = screen.getByRole('heading');
      expect(title).toHaveClass('custom-title');
    });

    it('should render as h4 element', () => {
      render(<CardTitle>Card Title</CardTitle>);

      const title = screen.getByRole('heading');
      expect(title.tagName).toBe('H4');
    });
  });

  describe('CardDescription', () => {
    it('should render card description', () => {
      render(<CardDescription>Card description text</CardDescription>);

      const description = screen.getByText('Card description text');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-muted-foreground');
      expect(description).toHaveAttribute('data-slot', 'card-description');
      expect(description.tagName).toBe('P');
    });

    it('should apply custom className', () => {
      render(<CardDescription className="custom-desc">Description</CardDescription>);

      const description = screen.getByText('Description');
      expect(description).toHaveClass('custom-desc');
    });
  });

  describe('CardContent', () => {
    it('should render card content', () => {
      render(<CardContent data-testid="card-content">Content text</CardContent>);

      const content = screen.getByTestId('card-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('px-6');
      expect(content).toHaveAttribute('data-slot', 'card-content');
    });

    it('should apply custom className', () => {
      render(
        <CardContent className="custom-content" data-testid="card-content">
          Content
        </CardContent>,
      );

      const content = screen.getByTestId('card-content');
      expect(content).toHaveClass('custom-content');
    });
  });

  describe('CardFooter', () => {
    it('should render card footer', () => {
      render(<CardFooter data-testid="card-footer">Footer content</CardFooter>);

      const footer = screen.getByTestId('card-footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('flex', 'items-center', 'px-6', 'pb-6');
      expect(footer).toHaveAttribute('data-slot', 'card-footer');
    });

    it('should apply custom className', () => {
      render(
        <CardFooter className="custom-footer" data-testid="card-footer">
          Footer
        </CardFooter>,
      );

      const footer = screen.getByTestId('card-footer');
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('Complete Card', () => {
    it('should render complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByRole('heading', { name: 'Test Card' })).toBeInTheDocument();
      expect(screen.getByText('This is a test card')).toBeInTheDocument();
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('should maintain proper hierarchy', () => {
      render(
        <Card data-testid="card">
          <CardHeader data-testid="header">
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent data-testid="content">Content</CardContent>
        </Card>,
      );

      const card = screen.getByTestId('card');
      const header = screen.getByTestId('header');
      const content = screen.getByTestId('content');

      expect(card).toContainElement(header);
      expect(card).toContainElement(content);
      expect(header).toContainElement(screen.getByRole('heading'));
    });
  });
});
