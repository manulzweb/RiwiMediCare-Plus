/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  rootDir: 'src',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '(.+)\\.js': '$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },
  clearMocks: true,
  passWithNoTests: true,
  coverageDirectory: '../coverage',
  collectCoverageFrom: [
    'services/**/*.ts',
    'middleware/**/*.ts',
    'errors/**/*.ts',
    'utils/**/*.ts',
    'constants/**/*.ts',
    'schemas/**/*.ts',
    '!**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      statements: 40,
      branches: 25,
      functions: 40,
      lines: 40,
    },
  },
};
