/**
 * @fileoverview Typography Examples - Showcase of typography components
 * 
 * @author Kafkasder Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Text, Heading } from '../ui';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function TypographyExamples() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <Heading level={1} balance>Typography System Examples</Heading>
        <Text variant="caption" color="muted">
          Demonstrating the Text and Heading components with various configurations
        </Text>
      </div>

      {/* Heading Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Heading Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Text variant="label" className="mb-2 block">Semantic Hierarchy (Default Sizes)</Text>
            <div className="space-y-2">
              <Heading level={1}>Heading Level 1</Heading>
              <Heading level={2}>Heading Level 2</Heading>
              <Heading level={3}>Heading Level 3</Heading>
              <Heading level={4}>Heading Level 4</Heading>
              <Heading level={5}>Heading Level 5</Heading>
              <Heading level={6}>Heading Level 6</Heading>
            </div>
          </div>

          <div>
            <Text variant="label" className="mb-2 block">Custom Sizes</Text>
            <div className="space-y-2">
              <Heading level={2} size="4xl">Large Visual Title (H2)</Heading>
              <Heading level={1} size="lg">Small Visual Title (H1)</Heading>
            </div>
          </div>

          <div>
            <Text variant="label" className="mb-2 block">Different Weights and Colors</Text>
            <div className="space-y-2">
              <Heading level={3} weight="bold">Bold Heading</Heading>
              <Heading level={3} color="primary">Primary Colored Heading</Heading>
              <Heading level={3} color="muted">Muted Heading</Heading>
            </div>
          </div>

          <div>
            <Text variant="label" className="mb-2 block">Typography Utilities</Text>
            <div className="space-y-2">
              <Heading level={2} balance className="max-w-md">
                This Heading Uses Text Balance for Better Line Breaks
              </Heading>
              <Heading level={3} pretty className="max-w-md">
                This Heading Uses Text Pretty to Prevent Orphaned Words at the End
              </Heading>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Text Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Text variant="label" className="mb-2 block">Text Variants</Text>
            <div className="space-y-2">
              <Text variant="body">Body text (default variant)</Text>
              <Text variant="caption">Caption text for descriptions</Text>
              <Text variant="label">Label text for forms</Text>
              <Text variant="code">inline code example</Text>
              <Text variant="kbd">Ctrl+Shift+P</Text>
            </div>
          </div>

          <div>
            <Text variant="label" className="mb-2 block">Text Sizes</Text>
            <div className="space-y-2">
              <Text size="xs">Extra small text</Text>
              <Text size="sm">Small text</Text>
              <Text size="md">Medium text (default)</Text>
              <Text size="lg">Large text</Text>
              <Text size="xl">Extra large text</Text>
            </div>
          </div>

          <div>
            <Text variant="label" className="mb-2 block">Text Weights</Text>
            <div className="space-y-2">
              <Text weight="normal">Normal weight</Text>
              <Text weight="medium">Medium weight</Text>
              <Text weight="semibold">Semibold weight</Text>
              <Text weight="bold">Bold weight</Text>
            </div>
          </div>

          <div>
            <Text variant="label" className="mb-2 block">Text Colors</Text>
            <div className="space-y-2">
              <Text color="foreground">Default foreground</Text>
              <Text color="muted">Muted text</Text>
              <Text color="primary">Primary colored text</Text>
              <Text color="success">Success text</Text>
              <Text color="warning">Warning text</Text>
              <Text color="error">Error text</Text>
              <Text color="neutral">Neutral text</Text>
            </div>
          </div>

          <div>
            <Text variant="label" className="mb-2 block">Typography Utilities</Text>
            <div className="space-y-4 max-w-md">
              <div>
                <Text variant="caption" color="muted" className="mb-1 block">Text Balance:</Text>
                <Text balance>
                  This text uses balance for better wrapping in short paragraphs and headings.
                </Text>
              </div>
              <div>
                <Text variant="caption" color="muted" className="mb-1 block">Text Pretty:</Text>
                <Text pretty>
                  This longer text uses pretty to prevent orphaned words at the end of paragraphs for better typography and readability.
                </Text>
              </div>
              <div>
                <Text variant="caption" color="muted" className="mb-1 block">Text Truncate:</Text>
                <Text truncate>
                  This very long text will be truncated with an ellipsis when it overflows its container width.
                </Text>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Practical Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Practical Usage Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Text variant="label" className="mb-2 block">Form Example</Text>
            <div className="space-y-2">
              <label htmlFor="example-email">
                <Text variant="label">Email Address</Text>
              </label>
              <input 
                id="example-email" 
                type="email" 
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="Enter your email"
              />
              <Text variant="caption" color="muted">
                We&apos;ll never share your email with anyone else.
              </Text>
            </div>
          </div>

          <div>
            <Text variant="label" className="mb-2 block">Error State Example</Text>
            <div className="space-y-2">
              <Text variant="label">Password</Text>
              <input 
                type="password" 
                className="w-full px-3 py-2 border border-error rounded-md"
              />
              <Text variant="caption" color="error">
                Password must be at least 8 characters long.
              </Text>
            </div>
          </div>

          <div>
            <Text variant="label" className="mb-2 block">Code Documentation Example</Text>
            <div className="space-y-2">
              <Text>
                To save a file, press <Text variant="kbd">Ctrl+S</Text>
              </Text>
              <Text>
                Use the <Text variant="code">useState</Text> hook for state management.
              </Text>
            </div>
          </div>

          <div>
            <Text variant="label" className="mb-2 block">Card Content Example</Text>
            <Card className="max-w-md">
              <CardHeader>
                <Heading level={4} size="lg">Feature Card</Heading>
                <Text variant="caption" color="muted">Enhanced typography system</Text>
              </CardHeader>
              <CardContent>
                <Text pretty>
                  This card demonstrates how the typography components work together to create consistent and accessible content layouts.
                </Text>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TypographyExamples;