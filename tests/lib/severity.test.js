import { describe, it, expect } from 'vitest'
import { getSeverity } from '../../lib/severity.js'

describe('getSeverity', () => {
  it('returns "high" for major diff', () => {
    expect(getSeverity('1.0.0', '2.0.0')).toBe('high')
  })

  it('returns "medium" for minor diff', () => {
    expect(getSeverity('1.0.0', '1.1.0')).toBe('medium')
  })

  it('returns "low" for patch diff', () => {
    expect(getSeverity('1.0.0', '1.0.1')).toBe('low')
  })

  it('returns "unknown" for invalid versions', () => {
    expect(getSeverity('^1.x', '2.0.0')).toBe('unknown')
    expect(getSeverity('1.0.0', '2.x')).toBe('unknown')
    expect(getSeverity('foo', 'bar')).toBe('unknown')
  })

  it('returns "unknown" for prerelease diff', () => {
    expect(getSeverity('1.0.0', '1.0.0-beta')).toBe('unknown')
  })

  it('returns "unknown" when version parsing fails', () => {
    expect(getSeverity(null, undefined)).toBe('unknown')
  })
})
