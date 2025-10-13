/**
 * @fileoverview SkipLinks Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { ArrowRight, Search, Menu, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getTouchTargetClasses } from '@/lib/design-system/accessibility';

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
    <div
      className="fixed top-0 left-0 z-[1600] w-full bg-info-600 text-white shadow-lg"
      role="navigation"
      aria-label="Skip links"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Hızlı erişim:</span>
          {SKIP_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                handleSkip(link.target);
              }}
              className={`flex items-center gap-1 px-3 py-1 text-sm ${getTouchTargetClasses()} bg-info-700 hover:bg-info-800 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-info-600`}
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

// Note: useFocusTrap has been moved to lib/design-system/accessibility.ts
// Import it from there if needed: import { useFocusTrap } from '@/lib/design-system/accessibility';
