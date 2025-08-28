// tests/lib/github.getFileContent.test.mjs
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { getFileContent } from '../../lib/github.js'
import { __mockGetContent } from '@octokit/rest'

// Mock Octokit entirely inside vi.mock
vi.mock('@octokit/rest', () => {
  const mockGetContent = vi.fn()
  const Octokit = vi.fn(() => ({
    repos: { getContent: mockGetContent }
  }))
  return { Octokit, __mockGetContent: mockGetContent }
})

beforeEach(() => {
  vi.clearAllMocks()
  process.env.GITHUB_OWNER = 'test-owner'
  process.env.GITHUB_TOKEN = 'test-token'
})

describe('getFileContent', () => {
  it('returns parsed JSON when content is valid JSON', async () => {
    __mockGetContent.mockResolvedValue({
      data: { content: Buffer.from(JSON.stringify({ foo: 'bar' })).toString('base64') }
    })
    const result = await getFileContent('my-repo', 'package.json')
    expect(result).toEqual({ foo: 'bar' })
  })

  it('returns raw string when content is not JSON', async () => {
    __mockGetContent.mockResolvedValue({
      data: { content: Buffer.from('20.12.2').toString('base64') }
    })
    const result = await getFileContent('my-repo', '.nvmrc')
    expect(result).toBe('20.12.2')
  })

  it('returns null for 404 errors', async () => {
    const err = new Error('Not Found')
    err.status = 404
    __mockGetContent.mockRejectedValue(err)
    const result = await getFileContent('my-repo', 'missing.txt')
    expect(result).toBeNull()
  })

  it('logs and returns null for non-404 errors', async () => {
    const err = new Error('Server Error')
    err.status = 500
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    __mockGetContent.mockRejectedValue(err)
    const result = await getFileContent('my-repo', 'fail.txt')
    expect(result).toBeNull()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
