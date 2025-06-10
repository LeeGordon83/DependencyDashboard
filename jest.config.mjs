export default {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  transform: {
    '\\.jsx?$': 'babel-jest',
    '\\.mjs$': 'babel-jest'
  },
  projects: [{
    displayName: 'unit-tests',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.?(m)js?(x)'],
    transformIgnorePatterns: []
  }]
}
