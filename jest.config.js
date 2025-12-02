module.exports = {
  projects: [
    {
      displayName: 'lib',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/lib/**/*.test.ts'],
      moduleFileExtensions: ['ts', 'js', 'json', 'node'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
    {
      displayName: 'store',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/store/**/*.test.ts'],
      moduleFileExtensions: ['ts', 'js', 'json', 'node'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
    {
      displayName: 'components',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/components/**/*.test.tsx'],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
      transform: {
        '^.+\.tsx?$': ['ts-jest', {
          tsconfig: 'tsconfig.jest.json',
        }],
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^react-markdown$': '<rootDir>/__mocks__/react-markdown.tsx',
        '^remark-gfm$': '<rootDir>/__mocks__/remark-gfm.ts',
        '^@/(.*)$': '<rootDir>/$1',
      },
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
