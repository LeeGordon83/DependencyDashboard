const { getSeverity } = require('../../lib/severity')

// Mock semver-diff
jest.mock('semver-diff', () => ({
  default: jest.fn()
}))
const semverDiff = require('semver-diff').default

describe('getSeverity', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns "high" for major diff', () => {
    semverDiff.mockReturnValue('major')
    expect(getSeverity('1.0.0', '2.0.0')).toBe('high')
  })

  it('returns "medium" for minor diff', () => {
    semverDiff.mockReturnValue('minor')
    expect(getSeverity('1.0.0', '1.1.0')).toBe('medium')
  })

  it('returns "low" for patch diff', () => {
    semverDiff.mockReturnValue('patch')
    expect(getSeverity('1.0.0', '1.0.1')).toBe('low')
  })

  it('returns "unknown" for non-concrete versions', () => {
    expect(getSeverity('^1.x', '2.0.0')).toBe('unknown')
    expect(getSeverity('1.0.0', '2.x')).toBe('unknown')
  })

  it('returns "unknown" for other diffs', () => {
    semverDiff.mockReturnValue('prerelease')
    expect(getSeverity('1.0.0', '1.0.0-beta')).toBe('unknown')
  })

  it('returns "unknown" on error', () => {
    semverDiff.mockImplementation(() => { throw new Error('fail') })
    expect(getSeverity('1.0.0', 'bad')).toBe('unknown')
  })
})
