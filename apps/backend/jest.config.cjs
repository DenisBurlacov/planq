/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@services/(.*?)(\\.js)?$': '<rootDir>/src/services/$1',
    '^@controllers/(.*?)(\\.js)?$': '<rootDir>/src/controllers/$1',
    '^@routes/(.*?)(\\.js)?$': '<rootDir>/src/routes/$1',
    '^@middleware/(.*?)(\\.js)?$': '<rootDir>/src/middleware/$1',
    '^@utils/(.*?)(\\.js)?$': '<rootDir>/src/utils/$1',
    '^@ws/(.*?)(\\.js)?$': '<rootDir>/src/ws/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          moduleResolution: 'bundler',
        },
      },
    ],
  },
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
  coverageThreshold: {
    // Thresholds — QA automation students expected to increase these
    global: { lines: 40, branches: 15, functions: 12, statements: 40 },
  },
  setupFiles: ['<rootDir>/tests/helpers/setup.ts'],
};
