import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@revloop/shared-types': './packages/shared-types/src',
      '@revloop/db': './packages/db/src',
      '@revloop/sdk': './packages/sdk/src',
    },
  },
});
