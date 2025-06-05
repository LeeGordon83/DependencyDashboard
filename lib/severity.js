// lib/severity.js
const semverDiff = require('semver-diff').default

function getSeverity (current, latest) {
  try {

       if (current.includes('x') || latest.includes('x')) {
      console.warn('⚠️ Skipping non-concrete version comparison:', { current, latest });
      return 'unknown';
    }

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

module.exports = { getSeverity }
