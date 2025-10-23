import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 60000, // Aumentado para testes E2E
    hookTimeout: 60000,
    teardownTimeout: 60000,
    setupFiles: ['./test/setup.ts'],
    // Configurações de descoberta de testes
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/e2e/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      '.git',
      '.cache',
      'coverage',
      '**/*.d.ts',
    ],
    // Configurações de saída e relatórios
    reporters: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results.json',
      html: './test-results.html',
    },
    // Configurações de cobertura
    coverage: {
      enabled: false, // Desabilitado para melhor performance
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/e2e/**',
        'src/**/test/**',
        'src/**/tests/**',
        'src/**/__tests__/**',
        'src/**/node_modules/**',
        'src/**/dist/**',
        'src/**/build/**',
      ],
    },
    // Configurações de saída
    silent: false,
    logHeapUsage: false, // Desabilitado para reduzir ruído
    // Configurações de paralelização
    pool: 'forks', // Mudado para forks para melhor isolamento
    poolOptions: {
      forks: {
        singleFork: false,
      },
    },
    // Configurações de retry para testes instáveis
    retry: 1,
    // Configurações de watch
    watch: false,
    // Configurações de bail
    bail: 0, // Não parar na primeira falha
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
