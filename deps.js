const { Octokit } = require('@octokit/rest')
const ncu = require('npm-check-updates')

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
const semverDiff = require('semver-diff').default

async function getPackageJson (repoName) {
  const { data } = await octokit.repos.getContent({
    owner: process.env.GITHUB_OWNER,
    repo: repoName,
    path: 'package.json'
  })
  const content = Buffer.from(data.content, 'base64').toString('utf-8')
  return JSON.parse(content)
}

function getSeverity (current, latest) {
  try {
    const cleanCurrent = current.replace(/^[^0-9]*/, '')
    const cleanLatest = latest.replace(/^[^0-9]*/, '')

    const diff = semverDiff(cleanCurrent, cleanLatest)

    switch (diff) {
      case 'major':
        return 'high'
      case 'minor':
        return 'medium'
      case 'patch':
        return 'low'
      default:
        return 'unknown'
    }
  } catch (e) {
    console.error('Error comparing versions:', e)
    return 'unknown'
  }
}

async function getRepoDependencyUpdates (repoName) {
  try {
    const pkg = await getPackageJson(repoName)

    const updates = await ncu.run({
      packageData: JSON.stringify(pkg)
    })

    const runtime = []
    const dev = []

    for (const [dep, latest] of Object.entries(updates)) {
      if (pkg.dependencies && pkg.dependencies[dep]) {
        const current = pkg.dependencies[dep]
        runtime.push({
          name: dep,
          current,
          latest,
          severity: getSeverity(current, latest)
        })
      } else if (pkg.devDependencies && pkg.devDependencies[dep]) {
        const current = pkg.devDependencies[dep]
        dev.push({
          name: dep,
          current,
          latest,
          severity: getSeverity(current, latest)
        })
      }
    }
    return { runtime, dev }
  } catch (err) {
    console.error('Error checking dependency updates:', err)
    throw err
  }
}
async function getSummaryStats (repoNames) {
  const results = await Promise.all(
    repoNames.map(repo => getRepoDependencyUpdates(repo))
  )

  const stats = {
    high: 0,
    medium: 0,
    low: 0,
    unknown: 0,
    totalChecked: 0,
    totalOutdated: 0
  }

  for (const repo of results) {
    const allDeps = [...repo.runtime, ...repo.dev]
    stats.totalChecked += allDeps.length

    for (const dep of allDeps) {
      const severity = dep.severity || 'unknown'
      if (!stats[severity]) {
        stats[severity] = 0
      }

      stats[severity] += 1
      stats.totalOutdated += 1
    }
  }

  return stats
}

module.exports = { getRepoDependencyUpdates, getSummaryStats }
