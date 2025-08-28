
describe('getSeverity (with semverDiff throwing)', () => {
  let getSeverityThrowing
  beforeAll(async () => {
    vi.mock('semver-diff', () => ({
      default: () => { throw new Error('semver error') }
    }))
    getSeverityThrowing = (await import('../../lib/severity.js')).getSeverity
  })

  it('returns "unknown" if semverDiff throws', () => {
    expect(getSeverityThrowing('1.0.0', '2.0.0')).toBe('unknown')
  })
})
