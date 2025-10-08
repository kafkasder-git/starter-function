/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, './tests/setup.ts')],
    globals: true,
    include: [
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/types/**',
        '**/mocks/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@components': path.resolve(__dirname, './components'),
      '@lib': path.resolve(__dirname, './lib'),
      '@services': path.resolve(__dirname, './services'),
      '@hooks': path.resolve(__dirname, './hooks'),
      '@stores': path.resolve(__dirname, './stores'),
      '@types': path.resolve(__dirname, './types'),
      '@utils': path.resolve(__dirname, './utils'),
    },
  },
});
