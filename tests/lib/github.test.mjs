// Mock @octokit/rest
const mockGetContent = vi.fn()

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    repos: { getContent: mockGetContent }
  }))
}))

let getFileContent

describe('getFileContent', () => {
  beforeEach(async () => {
    process.env.GITHUB_OWNER = 'test-owner'
    process.env.GITHUB_TOKEN = 'test-token'
    mockGetContent.mockReset()

    // Import AFTER mocks are registered
    const mod = await import('../../lib/github.js')
    getFileContent = mod.getFileContent
  })

  it('should fetch and parse package.json from the repo', async () => {
    const fakeJson = { name: 'my-package', version: '1.0.0' }
    const encoded = Buffer.from(JSON.stringify(fakeJson), 'utf-8').toString('base64')

    mockGetContent.mockResolvedValue({
      data: { content: encoded }
    })

    const result = await getFileContent('my-repo', 'package.json')

    expect(mockGetContent).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'my-repo',
      path: 'package.json'
    })

    expect(result).toEqual(fakeJson)
  })
})
