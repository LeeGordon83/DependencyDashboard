// tests/lib/github.getNodeVersion.test.mjs
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create a reusable mock function
const mockGetFileContent = vi.fn()

describe('getNodeVersion', () => {
  beforeEach(() => {
    mockGetFileContent.mockReset()
  })

  it('returns version from .nvmrc if present (full semver)', async () => {
    mockGetFileContent.mockImplementation(async (repo, filePath) => {
      if (filePath.endsWith('.nvmrc')) return '20.12.2'
      return null
    })
    const { getNodeVersion } = await import('../../lib/github.js')
    const version = await getNodeVersion('my-repo', mockGetFileContent)
    expect(version).toBe('20.12.2')
  })

  it('returns version from .nvmrc if present (major only)', async () => {
    mockGetFileContent.mockImplementation(async (repo, filePath) => {
      if (filePath.endsWith('.nvmrc')) return '18'
      return null
    })
    const { getNodeVersion } = await import('../../lib/github.js')
    const version = await getNodeVersion('my-repo', mockGetFileContent)
    expect(version).toBe('18')
  })

  it('returns version from package.json engines.node if .nvmrc missing', async () => {
    mockGetFileContent.mockImplementation(async (repo, filePath) => {
      if (filePath.endsWith('.nvmrc')) return null
      if (filePath.endsWith('package.json')) {
        return JSON.stringify({ engines: { node: '16.20.0' } })
      }
      return null
    })
    const { getNodeVersion } = await import('../../lib/github.js')
    const version = await getNodeVersion('my-repo', mockGetFileContent)
    expect(version).toBe('16.20.0')
  })

  it('returns "unknown" if neither .nvmrc nor engines.node is present', async () => {
    mockGetFileContent.mockResolvedValue(null)
    const { getNodeVersion } = await import('../../lib/github.js')
    const version = await getNodeVersion('my-repo', mockGetFileContent)
    expect(version).toBe('unknown')
  })

  it('returns "unknown" if engines.node is not a string', async () => {
    mockGetFileContent.mockImplementation(async (repo, filePath) => {
      if (filePath.endsWith('.nvmrc')) return null
      if (filePath.endsWith('package.json')) {
        return JSON.stringify({ engines: { node: 123 } })
      }
      return null
    })
    const { getNodeVersion } = await import('../../lib/github.js')
    const version = await getNodeVersion('my-repo', mockGetFileContent)
    expect(version).toBe('unknown')
  })

  it('returns "unknown" if engines.node contains "x"', async () => {
    mockGetFileContent.mockImplementation(async (repo, filePath) => {
      if (filePath.endsWith('.nvmrc')) return null
      if (filePath.endsWith('package.json')) {
        return JSON.stringify({ engines: { node: '16.x' } })
      }
      return null
    })
    const { getNodeVersion } = await import('../../lib/github.js')
    const version = await getNodeVersion('my-repo', mockGetFileContent)
    expect(version).toBe('unknown')
  })
})
