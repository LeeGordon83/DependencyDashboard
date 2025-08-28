import { describe, it, expect, beforeEach, vi } from 'vitest'
import Hapi from '@hapi/hapi'
import dashboardRoutes from '../../routes/dashboard.js'

import { getRepoDependencyUpdates } from '../../lib/dependencyUpdates.js'
import { getNodeVersionStats } from '../../lib/summaryStats.js'

vi.mock('../../lib/dependencyUpdates.js', () => ({
  getRepoDependencyUpdates: vi.fn()
}))

vi.mock('../../lib/summaryStats.js', () => ({
  getNodeVersionStats: vi.fn()
}))

vi.mock('../../lib/sortDeps.js', () => ({
  sortDeps: vi.fn((deps) => deps) // stubbed passthrough
}))

describe('GET /html-dashboard/{repo?}', () => {
  let server

  beforeEach(async () => {
    server = Hapi.server()
    await server.register(dashboardRoutes)

    // Stub h.view to inspect what it was called with
    server.decorate('toolkit', 'view', function (template, context) {
      return { template, context }
    })

    getRepoDependencyUpdates.mockReset()
    getNodeVersionStats.mockReset()
  })

  it('renders dashboard for a specific repo', async () => {
    process.env.GITHUB_REPOS = 'repo1,repo2'
    getRepoDependencyUpdates.mockResolvedValue({
      runtime: [{ name: 'express', current: '4.0.0', latest: '5.0.0', severity: 'high' }],
      dev: [{ name: 'jest', current: '^26.0.0', latest: '^29.0.0', severity: 'medium' }]
    })

    getNodeVersionStats.mockResolvedValue([
      { repo: 'repo1', node: { version: '16.0.0', latestLts: '18.17.0', severity: 'medium' } }
    ])

    const res = await server.inject({
      method: 'GET',
      url: '/html-dashboard/repo1?sort=name&dir=asc'
    })

    expect(res.statusCode).toBe(200)
    expect(res.result).toEqual({
      template: 'dashboard.njk',
      context: {
        repo: 'repo1',
        runtime: expect.any(Array),
        dev: expect.any(Array),
        repos: ['repo1', 'repo2'],
        nodeResults: expect.any(Array),
        sort: 'name'
      }
    })
  })

  it('renders dashboard for all repos when no repo param is given', async () => {
    process.env.GITHUB_REPOS = 'repo1,repo2'
    getRepoDependencyUpdates.mockResolvedValue({ runtime: [], dev: [] })
    getNodeVersionStats.mockResolvedValue([])

    const res = await server.inject({
      method: 'GET',
      url: '/html-dashboard'
    })

    expect(res.statusCode).toBe(200)
    expect(res.result).toEqual({
      template: 'dashboard.njk',
      context: {
        repo: 'All Repos',
        runtime: [],
        dev: [],
        repos: ['repo1', 'repo2'],
        nodeResults: [],
        sort: 'name'
      }
    })
  })

  it('returns 500 and logs on error', async () => {
    process.env.GITHUB_REPOS = 'repo1'
    getRepoDependencyUpdates.mockRejectedValue(new Error('Something went wrong'))

    const res = await server.inject({
      method: 'GET',
      url: '/html-dashboard/repo1'
    })

    expect(res.statusCode).toBe(500)
    expect(res.payload).toContain('Internal Server Error')
  })
})
