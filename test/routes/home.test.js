const Hapi = require('@hapi/hapi')
const homeRoute = require('./../../routes/home')
const { getSummaryStats, getNodeVersionStats } = require('../../lib/summaryStats')

describe('GET / route', () => {
  let server

beforeEach(async () => {
  server = Hapi.server()
  await server.register(homeRoute)
  server.decorate('toolkit', 'view', function (template, context) {
    return { template, context }
  })
  getSummaryStats.mockReset()
  getNodeVersionStats.mockReset()
})

it('should return a 200 response and render view', async () => {
  getSummaryStats.mockResolvedValue({ foo: 1 })
  getNodeVersionStats.mockResolvedValue({ bar: 2 })

  const response = await server.inject({
    method: 'GET',
    url: '/'
  })

  expect(response.statusCode).toBe(200)
  expect(response.result).toEqual({
    template: 'home.njk',
    context: {
      repos: [],
      stats: { foo: 1 },
      nodeResults: { bar: 2 }
    }
  })
})
})
jest.mock('../../lib/summaryStats', () => ({
  getSummaryStats: jest.fn(),
  getNodeVersionStats: jest.fn()
}))

describe('home.js route plugin', () => {
  let server
  let originalEnv

  beforeAll(() => {
    originalEnv = process.env.GITHUB_REPOS
  })

  afterAll(() => {
    process.env.GITHUB_REPOS = originalEnv
  })

  beforeEach(async () => {
    server = Hapi.server()
    await server.register(homeRoute)
    // Stub h.view to just return its arguments for inspection
    server.decorate('toolkit', 'view', function (template, context) {
      return { template, context }
    })
    getSummaryStats.mockReset()
    getNodeVersionStats.mockReset()
  })

  it('calls summary functions with repos from env and renders view', async () => {
    process.env.GITHUB_REPOS = 'repo1, repo2'
    getSummaryStats.mockResolvedValue({ foo: 1 })
    getNodeVersionStats.mockResolvedValue({ bar: 2 })

    const res = await server.inject({ method: 'GET', url: '/' })

    expect(getSummaryStats).toHaveBeenCalledWith(['repo1', 'repo2'])
    expect(getNodeVersionStats).toHaveBeenCalledWith(['repo1', 'repo2'])
    expect(res.result).toEqual({
      template: 'home.njk',
      context: {
        repos: ['repo1', 'repo2'],
        stats: { foo: 1 },
        nodeResults: { bar: 2 }
      }
    })
  })

  it('handles missing GITHUB_REPOS env as empty array', async () => {
    delete process.env.GITHUB_REPOS
    getSummaryStats.mockResolvedValue({ a: 1 })
    getNodeVersionStats.mockResolvedValue({ b: 2 })

    const res = await server.inject({ method: 'GET', url: '/' })

    expect(getSummaryStats).toHaveBeenCalledWith([])
    expect(getNodeVersionStats).toHaveBeenCalledWith([])
    expect(res.result).toEqual({
      template: 'home.njk',
      context: {
        repos: [],
        stats: { a: 1 },
        nodeResults: { b: 2 }
      }
    })
  })
})
