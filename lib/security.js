import got from 'got'
import dotenv from 'dotenv'
dotenv.config()
import { normaliseVersion } from './versionUtils.js'

const REGISTRY_URL = process.env.NPM_REGISTRY_URL
/**
 * Fetch npm package metadata from registry
 */
export async function getPackageMetadata(pkgName, version) {
  try {
    const url = `${REGISTRY_URL.replace(/\/$/, '')}/${pkgName}`
    const data = await got(url).json()
    const latestData = data.versions?.[version] || {}
    return {
      license: latestData.license || data.license || null,
      time: data.time || {}
    }
  } catch (err) {
    if (err.response?.statusCode === 404) {
      console.warn(`Package not found on npm: ${pkgName}`)
      return { license: null, time: {} }
    }
    console.error(`Failed to fetch metadata for ${pkgName}@${version}:`, err.message)
    return { license: null, time: {} }
  }
}


/**
 * Get last publish date for a package
 */
export function getLastPublishDate(metadata, version) {
  
  return metadata.time?.[version] || null
}

/**
 * Very basic staleness check (e.g. >2 years old)
 */
export function isStale(lastPublishDate) {
  if (!lastPublishDate) return false
  const diffYears = (Date.now() - new Date(lastPublishDate)) / (1000 * 60 * 60 * 24 * 365)
  return diffYears > 2
}
