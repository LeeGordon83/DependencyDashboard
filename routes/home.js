const { getSummaryStats, getNodeVersionStats } = require('../lib/summaryStats')

module.exports = {
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

          const stats = await getSummaryStats(repos)
          const nodeResults = await getNodeVersionStats(repos)

          return h.view('home.njk', { repos, stats, nodeResults })
        }
      })
    }
  }
}
