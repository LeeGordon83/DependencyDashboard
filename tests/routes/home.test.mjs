// Import mocked functions AFTER mocking
import { getSummaryStats, getNodeVersionStats } from '../../lib/summaryStats.js'
import Hapi from '@hapi/hapi'
import Vision from '@hapi/vision'
import Path from 'path'
import { fileURLToPath } from 'url'
import homeRoutes from '../../routes/home.js'
import Nunjucks from 'nunjucks'

// Mock environment variable
process.env.GITHUB_REPOS = 'repo1,repo2'

// Mock modules
vi.mock('../../lib/summaryStats.js', () => ({
  getSummaryStats: vi.fn(() => ({ total: 3 })),
  getNodeVersionStats: vi.fn(() => ({ lts: 2, current: 1 }))
}))

vi.mock('../../lib/dependencyUpdates.js', () => ({
  getRepoDependencyUpdates: vi.fn(async () => ({
    runtime: [],
    dev: []
  }))
}))

describe('GET /', () => {
  let server

  beforeEach(async () => {
    const __dirname = Path.dirname(fileURLToPath(import.meta.url))

    server = Hapi.server()

    await server.register(Vision)

    server.views({
      engines: {
        njk: {
          compile: (src, options) => {
            const template = Nunjucks.compile(src, options.environment)
            return (context) => template.render(context)
          },
          prepare: (options, next) => {
            options.compileOptions.environment = Nunjucks.configure(options.path, { autoescape: true })
            return next()
          }
        }
      },
      path: Path.resolve(__dirname, '../../views'),
      isCached: false
    })

    server.ext('onPreResponse', (request, h) => {
      if (request.response.isBoom) {
        console.error('💥 BOOM ERROR:', request.response)
      }
      return h.continue
    })

    await server.register(homeRoutes)
  })

  test('renders home page successfully with expected data', async () => {
    const res = await server.inject({ method: 'GET', url: '/' })

    expect(res.statusCode).toBe(200)

    // Check that HTML contains expected values
    expect(res.payload).toContain('Dependency Dashboard')
    expect(res.payload).toContain('repo1')
    expect(res.payload).toContain('repo2')

    // Check that logic functions were called
    expect(getSummaryStats).toHaveBeenCalledWith(['repo1', 'repo2'])
    expect(getNodeVersionStats).toHaveBeenCalledWith(['repo1', 'repo2'])
  })
})
