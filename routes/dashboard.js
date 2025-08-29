import { getRepoDependencyUpdates } from '../lib/dependencyUpdates.js'
import { getNodeVersionStats } from '../lib/summaryStats.js'
import { sortDeps } from '../lib/sortDeps.js'

export default {
  name: 'dashboardRoutes',
  register: async function (server) {
    server.route([
      {
        method: 'GET',
        path: '/html-dashboard/{repo?}',
        handler: async (request, h) => {
          try {
            const repos = process.env.GITHUB_REPOS
              ? process.env.GITHUB_REPOS.split(',').map(r => r.trim())
              : []

            const repoName = request.params.repo
            const sort = request.query.sort || 'name'
            const dir = request.query.dir === 'desc' ? 'desc' : 'asc'

            let data = { runtime: [], dev: [], security: { outdated: 0, highSeverity: 0, mediumSeverity: 0, lastUpdated: null } }
            if (repoName) {
              data = await getRepoDependencyUpdates(repoName)
            }

            const runtime = sortDeps(data.runtime, sort, dir)
            const dev = sortDeps(data.dev, sort, dir)

            const nodeResults = await getNodeVersionStats(repos)

            return h.view('dashboard.njk', {
              repo: repoName || 'All Repos',
              runtime,
              dev,
              repos,
              nodeResults,
              sort,
              dir,
              security: data.security
            })
          } catch (err) {
            console.error('Error loading dashboard view:', err)
            return h.response('Internal Server Error').code(500)
          }
        }
      }
    ])
  }
}
