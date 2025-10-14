/**
 * @fileoverview Lighthouse CI Configuration
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

module.exports = {
  ci: {
    collect: {
      // Static site için build output'u kullan
      staticDistDir: './dist',
      // Veya local server başlat
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/dashboard',
        'http://localhost:4173/beneficiaries',
        'http://localhost:4173/donations',
      ],
      numberOfRuns: 3,
    },
    assert: {
      // Performance thresholds
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Specific metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        
        // Bundle size checks
        'unused-javascript': ['warn', { maxNumericValue: 0.1 }],
        'unused-css-rules': ['warn', { maxNumericValue: 0.1 }],
        
        // Accessibility checks
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'button-name': 'error',
      },
    },
    upload: {
      // GitHub Actions'da artifact olarak upload et
      target: 'temporary-public-storage',
    },
  },
};
