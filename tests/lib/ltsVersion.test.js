const { getLatestLtsVersion, calcVersion } = require('../../lib/ltsVersion')
const got = require('got').default

jest.mock('got', () => ({
  default: jest.fn()
}))

describe('calcVersion', () => {
  it('calculates version number correctly', () => {
    expect(calcVersion('v18.17.1')).toBe(18017001)
    expect(calcVersion('v20.5.0')).toBe(20005000)
    expect(calcVersion('v0.0.1')).toBe(1)
  })

  it('throws on invalid version string', () => {
    expect(() => calcVersion('foo')).toThrow(/version regex failed/)
    expect(() => calcVersion('1.2')).toThrow(/version regex failed/)
  })
})

describe('getLatestLtsVersion', () => {
  it('returns the latest LTS version', async () => {
  got.mockImplementation(() => ({
    json: async () => ([
      { version: 'v18.17.1', lts: 'Hydrogen' },
      { version: 'v20.5.0', lts: 'Iron' },
      { version: 'v21.0.0', lts: false }
    ])
  }))

    const result = await getLatestLtsVersion()
    expect(result).toBe('20.5.0')
  })

  it('ignores non-LTS versions', async () => {
    got.mockImplementation(() => ({
      json: async () => ([
        { version: 'v21.0.0', lts: false },
        { version: 'v18.17.1', lts: 'Hydrogen' }
      ])
    }))

    const result = await getLatestLtsVersion()
    expect(result).toBe('18.17.1')
  })
})
