// lib/dependencyUpdates.js
import ncu from 'npm-check-updates'
import { getFileContent } from './github.js'
import { getSeverity } from './severity.js'
import { getPackageMetadata, getLastPublishDate, isStale } from './security.js'

export async function getRepoDependencyUpdates(repoName) {
  try {
    const pkg = await getFileContent(repoName, 'package.json')
    const updates = await ncu.run({ packageData: JSON.stringify(pkg) })

    const runtime = []
    const dev = []

    for (const [dep, latest] of Object.entries(updates)) {
      let section = null
      let current = null

      if (pkg.dependencies && pkg.dependencies[dep]) {
        section = runtime
        current = pkg.dependencies[dep]
      } else if (pkg.devDependencies && pkg.devDependencies[dep]) {
        section = dev
        current = pkg.devDependencies[dep]
      }

      if (section) {
        const severity = getSeverity(current, latest)
        const metadata = await getPackageMetadata(dep, latest)
        const lastPublish = getLastPublishDate(metadata, latest)
        const stale = isStale(lastPublish)

        section.push({
          name: dep,
          current,
          latest,
          severity,
          license: metadata.license || 'unknown',
          lastPublish,
          stale
        })
      }
    }

    return { runtime, dev }
  } catch (err) {
    console.error('Error checking dependency updates:', err)
    throw err
  }
}
