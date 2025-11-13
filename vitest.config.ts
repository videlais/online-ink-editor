import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/docs/**',
      '**/e2e/**', // Exclude Playwright E2E tests
      '**/.{idea,git,cache,output,temp}/**',
      '**/*.disabled.*', // Exclude disabled test files
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'e2e/', // Exclude E2E from coverage
        '**/*.config.ts',
        '**/main.tsx',
        'dist/',
        'docs/',
      ],
    },
  },
});
