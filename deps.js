const { Octokit } = require('@octokit/rest')
const ncu = require('npm-check-updates')

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

async function getPackageJson (repoName) {
  const { data } = await octokit.repos.getContent({
    owner: process.env.GITHUB_OWNER,
    repo: repoName,
    path: 'package.json'
  })
  const content = Buffer.from(data.content, 'base64').toString('utf-8')
  return JSON.parse(content)
}

function getSeverity(current, latest) {
  try {
    const [curMajor] = current.replace(/[^0-9.]/g, '').split('.').map(Number)
    const [newMajor] = latest.replace(/[^0-9.]/g, '').split('.').map(Number)

    if (newMajor > curMajor) return 'high'     // Major version bump
    if (current !== latest) return 'medium'    // Minor or patch bump
    return 'low'
  } catch (e) {
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
          current: current,
          latest,
          severity: getSeverity(current, latest)
        })
      } else if (pkg.devDependencies && pkg.devDependencies[dep]) {
        const current = pkg.devDependencies[dep]
        dev.push({
          name: dep,
          current: current,
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

module.exports = { getRepoDependencyUpdates }
