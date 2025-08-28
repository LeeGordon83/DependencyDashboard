import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.js', '**/*.test.mjs']
  },
  coverage: {
    provider: 'v8', // or 'c8'
    exclude: [
      '**/index.js',
      'DependencyDashboard/index.js'
    ]
  },
  root: '.'
})
