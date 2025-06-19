import { getRepoDependencyUpdates } from '../lib/dependencyUpdates.js'
import { getNodeVersionStats } from '../lib/summaryStats.js'

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

            let data = { runtime: [], dev: [] }
            if (repoName) {
              data = await getRepoDependencyUpdates(repoName)
            }

            const nodeResults = await getNodeVersionStats(repos)

            return h.view('dashboard.njk', {
              repo: repoName || 'All Repos',
              runtime: data.runtime || [],
              dev: data.dev || [],
              repos,
              nodeResults
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
