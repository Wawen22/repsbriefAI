import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from './vitest.config'

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['tests/e2e/**/*.test.ts'],
      exclude: ['tests/unit/**/*.test.ts'],
      passWithNoTests: false,
    },
  })
)
