import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('got', () => {
  // define mocks here, inside factory, no outside references
  return {
    default: vi.fn(() => ({
      json: vi.fn().mockResolvedValue([
        { version: 'v18.17.0', lts: 'Hydrogen' },
        { version: 'v20.5.0', lts: 'Gallium' }
      ])
    }))
  }
})

import { getLatestLtsVersion, calcVersion } from '../../lib/ltsVersion.js'

describe('calcVersion', () => {
  it('calculates version number correctly', () => {
    expect(calcVersion('v18.17.1')).toBe(18017001)
    expect(calcVersion('v20.5.0')).toBe(20005000)
    expect(calcVersion('v0.0.1')).toBe(1)
  })

  it('throws for invalid version string', () => {
    expect(() => calcVersion('foo')).toThrow(/version regex failed/i)
    expect(() => calcVersion('1.2')).toThrow()
  })
})

describe('getLatestLtsVersion', () => {
  it('returns latest LTS version from JSON', async () => {
    const result = await getLatestLtsVersion()
    expect(result).toBe('20.5.0')
  })

  it('throws if no LTS versions are found', async () => {
    // Override mock inside test
    const got = (await import('got')).default
    got.mockImplementationOnce(() => ({
      json: () => Promise.resolve([])
    }))

    await expect(getLatestLtsVersion()).rejects.toThrow()
  })
})
