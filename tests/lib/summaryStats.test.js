import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock modules with actual function names used
vi.mock('../../lib/dependencyUpdates', () => ({
  getRepoDependencyUpdates: vi.fn()
}))

vi.mock('../../lib/github', () => ({
  getNodeVersion: vi.fn()
}))

vi.mock('../../lib/severity', () => ({
  getSeverity: vi.fn(() => 'mock-severity')
}))

vi.mock('../../lib/ltsVersion', () => ({
  getLatestLtsVersion: vi.fn()
}))

// Import after mocks
import { getRepoDependencyUpdates } from '../../lib/dependencyUpdates'
import { getNodeVersion } from '../../lib/github' // 👈 fix
import { getSeverity } from '../../lib/severity'
import { getLatestLtsVersion } from '../../lib/ltsVersion'
import { getSummaryStats, getNodeVersionStats } from '../../lib/summaryStats'

describe('getSummaryStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should count severities correctly from multiple repos', async () => {
    getRepoDependencyUpdates
      .mockResolvedValueOnce({
        runtime: [
          { name: 'express', current: '^4.0.0', latest: '^5.0.0', severity: 'high' },
          { name: 'debug', current: '^4.0.0', latest: '^4.3.4', severity: 'low' }
        ],
        dev: [
          { name: 'jest', current: '^26.0.0', latest: '^29.0.0', severity: 'medium' }
        ]
      })
      .mockResolvedValueOnce({
        runtime: [],
        dev: [
          { name: 'eslint', current: '^7.0.0', latest: '^8.0.0', severity: 'high' },
          { name: 'prettier', current: '^2.0.0', latest: '^3.0.0', severity: 'unknown' }
        ]
      })

    const result = await getSummaryStats(['repo-one', 'repo-two'])

    expect(result).toEqual({
      high: 2,
      medium: 1,
      low: 1,
      unknown: 1,
      totalWithIssues: 4,
      totalChecked: 5
    })
  })
})

describe('getNodeVersionStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return node version severity for each repo', async () => {
    getLatestLtsVersion.mockResolvedValue('18.17.0')

    getNodeVersion
      .mockResolvedValueOnce('16.0.0')
      .mockResolvedValueOnce('18.17.0')

    getSeverity
      .mockImplementation((current, latest) =>
        current === '16.0.0' ? 'medium' : 'low'
      )

    const result = await getNodeVersionStats(['repo-a', 'repo-b'])

    expect(result).toEqual([
      {
        repo: 'repo-a',
        node: {
          version: '16.0.0',
          latestLts: '18.17.0',
          severity: 'medium'
        }
      },
      {
        repo: 'repo-b',
        node: {
          version: '18.17.0',
          latestLts: '18.17.0',
          severity: 'low'
        }
      }
    ])
  })

  it('should handle errors from getNodeVersion and continue', async () => {
    getLatestLtsVersion.mockResolvedValue('18.17.0')

    getNodeVersion
      .mockResolvedValueOnce('14.0.0')
      .mockRejectedValueOnce(new Error('API error'))

    getSeverity.mockReturnValue('high')

    const result = await getNodeVersionStats(['ok-repo', 'bad-repo'])

    expect(result).toEqual([
      {
        repo: 'ok-repo',
        node: {
          version: '14.0.0',
          latestLts: '18.17.0',
          severity: 'high'
        }
      },
      {
        repo: 'bad-repo',
        node: {
          version: 'error',
          latestLts: '18.17.0',
          severity: 'unknown'
        }
      }
    ])
  })
})
