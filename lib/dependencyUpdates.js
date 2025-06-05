// lib/dependencyUpdates.js
const ncu = require('npm-check-updates')
const { getPackageJson } = require('./github')
const { getSeverity } = require('./severity')

async function getRepoDependencyUpdates (repoName) {
  try {
    const pkg = await getPackageJson(repoName)
    const updates = await ncu.run({ packageData: JSON.stringify(pkg) })

    const runtime = []
    const dev = []

    for (const [dep, latest] of Object.entries(updates)) {
      if (pkg.dependencies && pkg.dependencies[dep]) {
        const current = pkg.dependencies[dep]
        runtime.push({ name: dep, current, latest, severity: getSeverity(current, latest) })
      } else if (pkg.devDependencies && pkg.devDependencies[dep]) {
        const current = pkg.devDependencies[dep]
        dev.push({ name: dep, current, latest, severity: getSeverity(current, latest) })
      }
    }

    return { runtime, dev }
  } catch (err) {
    console.error('Error checking dependency updates:', err)
    throw err
  }
}

module.exports = { getRepoDependencyUpdates }
