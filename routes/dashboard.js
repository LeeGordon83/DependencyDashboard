const { getRepoDependencyUpdates } = require('../lib/dependencyUpdates')
const { getNodeVersionStats } = require('../lib/summaryStats')

exports.plugin = {
  name: 'dashboardRoutes',
  register: async function (server) {
    server.route([
      {
        method: 'GET',
        path: '/dashboard',
        handler: async (request, h) => {
          try {
            const data = await getRepoDependencyUpdates()
            return data
          } catch (err) {
            console.error('Error loading dashboard JSON:', err)
            return h.response('Internal Server Error').code(500)
          }
        }
      },
      {
        method: 'GET',
        path: '/html-dashboard/{repo?}',
        handler: async (request, h) => {
          try {
            const repos = process.env.GITHUB_REPOS
              ? process.env.GITHUB_REPOS.split(',').map(r => r.trim())
              : []

            const repoName = request.params.repo || process.env.GITHUB_REPO
            const data = await getRepoDependencyUpdates(repoName)
            const nodeResults = await getNodeVersionStats(repos)

            return h.view('dashboard.njk', {
              repo: repoName,
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
