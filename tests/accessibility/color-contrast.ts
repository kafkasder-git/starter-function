// Color contrast testing utilities
export class ColorContrastTester {
  private readonly container: Element;

  constructor(container: Element = document.body) {
    this.container = container;
  }

  // Calculate relative luminance of a color
  private getRelativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  // Calculate contrast ratio between two colors
  private getContrastRatio(
    color1: [number, number, number],
    color2: [number, number, number],
  ): number {
    const l1 = this.getRelativeLuminance(...color1);
    const l2 = this.getRelativeLuminance(...color2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  // Parse RGB color from CSS color value
  private parseColor(colorStr: string): [number, number, number] | null {
    // Handle rgb() format
    const rgbMatch = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(colorStr);
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }

    // Handle rgba() format
    const rgbaMatch = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/.exec(colorStr);
    if (rgbaMatch) {
      return [parseInt(rgbaMatch[1]), parseInt(rgbaMatch[2]), parseInt(rgbaMatch[3])];
    }

    // Handle hex format
    const hexMatch = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colorStr);
    if (hexMatch) {
      return [parseInt(hexMatch[1], 16), parseInt(hexMatch[2], 16), parseInt(hexMatch[3], 16)];
    }

    // Handle named colors (basic set)
    const namedColors: Record<string, [number, number, number]> = {
      black: [0, 0, 0],
      white: [255, 255, 255],
      red: [255, 0, 0],
      green: [0, 128, 0],
      blue: [0, 0, 255],
      yellow: [255, 255, 0],
      cyan: [0, 255, 255],
      magenta: [255, 0, 255],
      gray: [128, 128, 128],
      grey: [128, 128, 128],
    };

    return namedColors[colorStr.toLowerCase()] || null;
  }

  // Get background color of an element (traversing up the DOM if transparent)
  private getBackgroundColor(element: Element): [number, number, number] {
    let currentElement: Element | null = element;

    while (currentElement && currentElement !== document.body) {
      const style = window.getComputedStyle(currentElement);
      const bgColor = style.backgroundColor;

      if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
        const color = this.parseColor(bgColor);
        if (color) return color;
      }

      currentElement = currentElement.parentElement;
    }

    // Default to white background
    return [255, 255, 255];
  }

  // Test color contrast for text elements
  testTextContrast(): {
    success: boolean;
    errors: string[];
    warnings: string[];
    results: {
      element: Element;
      textColor: [number, number, number] | null;
      backgroundColor: [number, number, number];
      contrastRatio: number;
      wcagAA: boolean;
      wcagAAA: boolean;
      isLargeText: boolean;
    }[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const results: {
      element: Element;
      textColor: [number, number, number] | null;
      backgroundColor: [number, number, number];
      contrastRatio: number;
      wcagAA: boolean;
      wcagAAA: boolean;
      isLargeText: boolean;
    }[] = [];

    // Find all text elements
    const textElements = this.container.querySelectorAll(
      [
        'p',
        'span',
        'div',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'a',
        'button',
        'label',
        'li',
        'td',
        'th',
        'caption',
        'input:not([type="hidden"])',
        'textarea',
        'select',
      ].join(', '),
    );

    textElements.forEach((element) => {
      const style = window.getComputedStyle(element);
      const textContent = (element as HTMLElement).textContent?.trim();

      // Skip elements without visible text
      if (!textContent || style.display === 'none' || style.visibility === 'hidden') {
        return;
      }

      const textColor = this.parseColor(style.color);
      const backgroundColor = this.getBackgroundColor(element);

      if (!textColor) {
        warnings.push(`Could not parse text color for ${this.getElementDescription(element)}`);
        return;
      }

      const contrastRatio = this.getContrastRatio(textColor, backgroundColor);

      // Determine if text is large with proper unit parsing
      const fontSizeStr = style.fontSize;
      let fontSizePx = 16; // Default fallback

      if (fontSizeStr) {
        const fontSizeMatch = /^([\d.]+)(.*)$/.exec(fontSizeStr);
        if (fontSizeMatch) {
          const value = parseFloat(fontSizeMatch[1]);
          const unit = fontSizeMatch[2] || 'px';

          switch (unit.toLowerCase()) {
            case 'px':
              fontSizePx = value;
              break;
            case 'pt':
              fontSizePx = value * (96 / 72); // Convert pt to px (1pt = 96/72px)
              break;
            case 'em':
            case 'rem':
              // For em/rem, we'd need to resolve against base font size
              // For now, assume 16px base and multiply
              fontSizePx = value * 16;
              break;
            default:
              fontSizePx = value; // Assume px if no unit
          }
        }
      }

      const fontWeight = style.fontWeight;
      const fontWeightNum =
        fontWeight === 'bold' || fontWeight === 'bolder'
          ? 700
          : fontWeight === 'normal' || fontWeight === 'lighter'
            ? 400
            : parseInt(fontWeight) || 400;

      // WCAG large text thresholds: >=24px normal weight or >=18.6667px bold/heavy
      const isLargeText = fontSizePx >= 24 || (fontSizePx >= 18.6667 && fontWeightNum >= 700);

      // WCAG contrast requirements
      const wcagAAThreshold = isLargeText ? 3 : 4.5;
      const wcagAAAThreshold = isLargeText ? 4.5 : 7;

      const wcagAA = contrastRatio >= wcagAAThreshold;
      const wcagAAA = contrastRatio >= wcagAAAThreshold;

      results.push({
        element,
        textColor,
        backgroundColor,
        contrastRatio,
        wcagAA,
        wcagAAA,
        isLargeText,
      });

      // Report failures
      if (!wcagAA) {
        errors.push(
          `${this.getElementDescription(element)} has insufficient contrast ratio: ${contrastRatio.toFixed(2)} ` +
            `(required: ${wcagAAThreshold})`,
        );
      } else if (!wcagAAA) {
        warnings.push(
          `${this.getElementDescription(element)} does not meet WCAG AAA contrast ratio: ${contrastRatio.toFixed(2)} ` +
            `(required: ${wcagAAAThreshold})`,
        );
      }
    });

    return {
      success: errors.length === 0,
      errors,
      warnings,
      results,
    };
  }

  // Test color contrast for interactive elements
  testInteractiveElementContrast(): {
    success: boolean;
    errors: string[];
    warnings: string[];
    results: {
      element: Element;
      state: 'normal' | 'hover' | 'focus' | 'active';
      contrastRatio: number;
      wcagAA: boolean;
    }[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const results: {
      element: Element;
      state: 'normal' | 'hover' | 'focus' | 'active';
      contrastRatio: number;
      wcagAA: boolean;
    }[] = [];

    const interactiveElements = this.container.querySelectorAll(
      [
        'button',
        'a',
        'input:not([type="hidden"])',
        'select',
        'textarea',
        '[role="button"]',
        '[role="link"]',
        '[tabindex]',
      ].join(', '),
    );

    interactiveElements.forEach((element) => {
      const htmlElement = element as HTMLElement;

      // Test normal state
      const normalStyle = window.getComputedStyle(element);
      this.testElementState(element, 'normal', normalStyle, results, errors, warnings);

      // Test focus state (simulate focus)
      htmlElement.focus();
      const focusStyle = window.getComputedStyle(element);
      this.testElementState(element, 'focus', focusStyle, results, errors, warnings);

      // Remove focus
      htmlElement.blur();
    });

    return {
      success: errors.length === 0,
      errors,
      warnings,
      results,
    };
  }

  private testElementState(
    element: Element,
    state: 'normal' | 'hover' | 'focus' | 'active',
    style: CSSStyleDeclaration,
    results: {
      element: Element;
      state: 'normal' | 'hover' | 'focus' | 'active';
      contrastRatio: number;
      wcagAA: boolean;
    }[],
    errors: string[],
    warnings: string[],
  ) {
    const textColor = this.parseColor(style.color);
    const backgroundColor = this.getBackgroundColor(element);

    if (!textColor) return;

    const contrastRatio = this.getContrastRatio(textColor, backgroundColor);
    const wcagAA = contrastRatio >= 4.5; // Standard threshold for interactive elements

    results.push({
      element,
      state,
      contrastRatio,
      wcagAA,
    });

    if (!wcagAA) {
      errors.push(
        `${this.getElementDescription(element)} in ${state} state has insufficient contrast ratio: ` +
          `${contrastRatio.toFixed(2)} (required: 4.5)`,
      );
    }
  }

  // Test color-only information
  testColorOnlyInformation(): {
    success: boolean;
    errors: string[];
    warnings: string[];
    elements: Element[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const elements: Element[] = [];

    // Look for elements that might rely on color alone
    const potentialColorOnlyElements = this.container.querySelectorAll(
      [
        '.text-red-500',
        '.text-green-500',
        '.text-yellow-500', // Tailwind color classes
        '.error',
        '.success',
        '.warning',
        '.danger',
        '.info',
        '[style*="color: red"]',
        '[style*="color: green"]',
        '[style*="color: yellow"]',
        '.red',
        '.green',
        '.yellow',
        '.blue',
      ].join(', '),
    );

    potentialColorOnlyElements.forEach((element) => {
      const textContent = (element as HTMLElement).textContent?.trim();
      const hasIcon = element.querySelector('svg, i, .icon');
      const hasTextIndicator =
        textContent &&
        (textContent.includes('error') ||
          textContent.includes('success') ||
          textContent.includes('warning') ||
          textContent.includes('required') ||
          textContent.includes('*'));

      elements.push(element);

      if (!hasIcon && !hasTextIndicator) {
        warnings.push(
          `${this.getElementDescription(element)} may rely on color alone to convey information. ` +
            'Consider adding icons or text indicators.',
        );
      }
    });

    return {
      success: errors.length === 0,
      errors,
      warnings,
      elements,
    };
  }

  // Comprehensive color contrast test
  runAllTests(): {
    success: boolean;
    errors: string[];
    warnings: string[];
    results: {
      textContrast: ReturnType<ColorContrastTester['testTextContrast']>;
      interactiveContrast: ReturnType<ColorContrastTester['testInteractiveElementContrast']>;
      colorOnlyInformation: ReturnType<ColorContrastTester['testColorOnlyInformation']>;
    };
  } {
    const results = {
      textContrast: this.testTextContrast(),
      interactiveContrast: this.testInteractiveElementContrast(),
      colorOnlyInformation: this.testColorOnlyInformation(),
    };

    const allErrors = [
      ...results.textContrast.errors,
      ...results.interactiveContrast.errors,
      ...results.colorOnlyInformation.errors,
    ];

    const allWarnings = [
      ...results.textContrast.warnings,
      ...results.interactiveContrast.warnings,
      ...results.colorOnlyInformation.warnings,
    ];

    return {
      success: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      results,
    };
  }

  private getElementDescription(element: Element): string {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const className = element.className ? `.${element.className.split(' ')[0]}` : '';
    const role = element.getAttribute('role') ? `[role="${element.getAttribute('role')}"]` : '';

    return `${tag}${id}${className}${role}`;
  }
}

// Convenience function for color contrast testing
export const testColorContrast = (container: Element = document.body) => {
  const tester = new ColorContrastTester(container);
  return tester.runAllTests();
};

// Export already declared above
