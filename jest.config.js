module.exports = {
  projects: [
    {
      displayName: 'formatters',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/lib/__tests__/formatters.test.ts'],
      moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    },
    {
      displayName: 'importParser',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/lib/__tests__/importParser.test.ts'],
      moduleFileExtensions: ['ts', 'js', 'json', 'node'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Optional: for browser mocks if needed
    },
    {
      displayName: 'api',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/app/api/**/*.test.ts'],
      moduleFileExtensions: ['ts', 'js', 'json', 'node'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
  ],
};
