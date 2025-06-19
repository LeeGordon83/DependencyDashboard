import dotenv from 'dotenv'
import { Octokit } from '@octokit/rest'
dotenv.config()

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

export async function getFileContent (repoName, filePath) {
  try {
    const { data } = await octokit.repos.getContent({
      owner: process.env.GITHUB_OWNER,
      repo: repoName,
      path: filePath
    })
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    try {
      return JSON.parse(content)
    } catch {
      return content
    }
  } catch (err) {
    if (err.status !== 404) {
      console.error(`Error in getFileContent for ${repoName}/${filePath}:`, err)
    }
    return null
  }
}

export async function getNodeVersion (repo) {
  // Check .nvmrc
  const nvmrc = await getFileContent(repo, '.nvmrc')
  if (nvmrc) {
    const version = nvmrc.trim()
    if (/^\d+\.\d+\.\d+$/.test(version) || /^\d+$/.test(version)) return version
    return version
  }

  // Fallback to package.json engines.node
  try {
    const pkgContent = await getFileContent(repo, 'package.json')
    if (pkgContent) {
      const pkg = JSON.parse(pkgContent)
      const engine = pkg.engines?.node
      if (engine && typeof engine === 'string' && !engine.includes('x')) {
        return engine
      }
    }
  } catch {}

  return 'unknown'
}
