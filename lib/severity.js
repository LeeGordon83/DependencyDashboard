// lib/severity.js
import semverDiff from 'semver-diff'

function normaliseVersion (version) {
  if (typeof version !== 'string') return null
  // Remove leading non-numeric chars (like 'v')
  const v = version.replace(/^[^\d]*/, '')
  // If it's just a major version (e.g. '20'), make it '20.0.0'
  if (/^\d+$/.test(v)) return `${v}.0.0`
  // If it's major.minor (e.g. '20.1'), make it '20.1.0'
  if (/^\d+\.\d+$/.test(v)) return `${v}.0`
  // If it's already full semver, return as is
  if (/^\d+\.\d+\.\d+$/.test(v)) return v
  return null // Not a valid version
}
export function getSeverity (current, latest) {
  try {
    const normCurrent = normaliseVersion(current)
    const normLatest = normaliseVersion(latest)
    if (!normCurrent || !normLatest) {
      console.warn('⚠️ Skipping invalid version comparison:', { current, latest })
      return 'unknown'
    }
    if (normCurrent.includes('x') || normLatest.includes('x')) {
      console.warn('⚠️ Skipping non-concrete version comparison:', { current, latest })
      return 'unknown'
    }

    const diff = semverDiff(normCurrent, normLatest)

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
