/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@angular-bhp-simulator/bhp-calculator': resolve(__dirname, '../../libs/bhp-calculator/src/index.ts'),
      '@angular-bhp-simulator/data-generator': resolve(__dirname, '../../libs/data-generator/src/index.ts'),
      '@angular-bhp-simulator/chart-components': resolve(__dirname, '../../libs/chart-components/src/index.ts'),
    },
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        esModuleInterop: true,
        moduleResolution: 'bundler',
        target: 'es2022',
        module: 'preserve',
        lib: ['es2020', 'dom'],
        paths: {
          '@angular-bhp-simulator/bhp-calculator': ['../../libs/bhp-calculator/src/index.ts'],
          '@angular-bhp-simulator/data-generator': ['../../libs/data-generator/src/index.ts'],
          '@angular-bhp-simulator/chart-components': ['../../libs/chart-components/src/index.ts'],
        },
      },
    },
  },
});
