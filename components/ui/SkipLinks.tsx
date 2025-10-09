/**
 * @fileoverview SkipLinks Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { ArrowRight, Search, Menu, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SkipLink {
  id: string;
  label: string;
  target: string;
  icon?: React.ReactNode;
}

const SKIP_LINKS: SkipLink[] = [
  {
    id: 'main-content',
    label: 'Ana içeriğe geç',
    target: 'main',
    icon: <ArrowRight className="h-4 w-4" />,
  },
  {
    id: 'navigation',
    label: 'Navigasyona geç',
    target: 'nav',
    icon: <Menu className="h-4 w-4" />,
  },
  {
    id: 'search',
    label: 'Aramaya geç',
    target: 'search',
    icon: <Search className="h-4 w-4" />,
  },
  {
    id: 'home',
    label: 'Ana sayfaya dön',
    target: 'home',
    icon: <Home className="h-4 w-4" />,
  },
];

export function SkipLinks() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show skip links when Tab is pressed first time
      if (e.key === 'Tab' && !e.shiftKey) {
        setIsVisible(true);
      }
    };

    const handleClick = () => {
      setIsVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleSkip = (target: string) => {
    const element = document.getElementById(target);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 z-50 w-full bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Hızlı erişim:</span>
          {SKIP_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => handleSkip(link.target)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-700 hover:bg-blue-800 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            >
              {link.icon}
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Focus trap hook for modals
export function useFocusTrap(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;

    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);
}
