import { vi, describe, it, expect } from 'vitest'

describe('getSeverity', () => {
  let getSeverity

  beforeAll(async () => {
    vi.mock('semver-diff', () => ({
      default: (current, latest) => {
        if (current === '1.0.0' && latest === '2.0.0') return 'major'
        if (current === '1.0.0' && latest === '1.1.0') return 'minor'
        if (current === '1.0.0' && latest === '1.0.1') return 'patch'
        if (current === '1.0.0' && latest === '1.0.0-beta') return 'prerelease'
        return undefined
      }
    }))
    getSeverity = (await import('../../lib/severity.js')).getSeverity
  })

  it('returns "high" for major diff', () => {
    expect(getSeverity('1.0.0', '2.0.0')).toBe('high')
  })

  it('returns "medium" for minor diff', () => {
    expect(getSeverity('1.0.0', '1.1.0')).toBe('medium')
  })

  it('returns "low" for patch diff', () => {
    expect(getSeverity('1.0.0', '1.0.1')).toBe('low')
  })

  it('returns "unknown" for prerelease diff', () => {
    expect(getSeverity('1.0.0', '1.0.0-beta')).toBe('unknown')
  })

  it('returns "unknown" for invalid versions', () => {
    expect(getSeverity('foo', 'bar')).toBe('unknown')
  })
})


