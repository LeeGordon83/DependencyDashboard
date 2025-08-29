// lib/versionUtils.js
export function normaliseVersion(version) {
  if (!version || typeof version !== 'string') return null
  // strip leading 'v', '^', '~', trim spaces
  const cleaned = version.replace(/^[v^~]/, '').trim()
  // basic semver check
  const semverRegex = /^\d+\.\d+\.\d+(-[\w.-]+)?$/
  return semverRegex.test(cleaned) ? cleaned : null
}
