import { getSummaryStats, getNodeVersionStats } from '../lib/summaryStats.js'

export default {
  plugin: {
    name: 'home-routes',
    register: async function (server, options) {
      server.route({
        method: 'GET',
        path: '/',
        handler: async (request, h) => {
          const repos = process.env.GITHUB_REPOS
            ? process.env.GITHUB_REPOS.split(',').map(r => r.trim())
            : []

          const nodeResults = await getNodeVersionStats(repos)
          const stats = await getSummaryStats(repos)

          return h.view('home.njk', { repos, stats, nodeResults })
        }
      })
    }
  }
}
