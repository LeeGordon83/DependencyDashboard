vi.mock('npm-check-updates', () => ({
  default: {
    run: vi.fn()
  }
}))

vi.mock('../../lib/github.js', () => ({
  getFileContent: vi.fn()
}))

vi.mock('../../lib/severity.js', () => ({
  getSeverity: vi.fn(() => 'mock-severity')
}))

describe('getRepoDependencyUpdates', () => {
  let getFileContent
  let getSeverity
  let ncu
  let getRepoDependencyUpdates

  beforeEach(async () => {
    vi.clearAllMocks()

    const github = await import('../../lib/github.js')
    const severity = await import('../../lib/severity.js')
    const ncuModule = await import('npm-check-updates')
    const updatesModule = await import('../../lib/dependencyUpdates.js')

    getFileContent = github.getFileContent
    getSeverity = severity.getSeverity
    ncu = ncuModule.default
    getRepoDependencyUpdates = updatesModule.getRepoDependencyUpdates
  })

  it('should return updated runtime and dev dependencies with mocked severity', async () => {
    getFileContent.mockResolvedValue({
      dependencies: {
        lodash: '^4.17.0'
      },
      devDependencies: {
        jest: '^27.0.0'
      }
    })

    ncu.run.mockResolvedValue({
      lodash: '^4.18.0',
      jest: '^29.0.0'
    })

    const result = await getRepoDependencyUpdates('some-repo')

    expect(result).toEqual({
      runtime: [
        {
          name: 'lodash',
          current: '^4.17.0',
          latest: '^4.18.0',
          severity: 'mock-severity'
        }
      ],
      dev: [
        {
          name: 'jest',
          current: '^27.0.0',
          latest: '^29.0.0',
          severity: 'mock-severity'
        }
      ]
    })

    expect(getFileContent).toHaveBeenCalledWith('some-repo', 'package.json')
    expect(ncu.run).toHaveBeenCalled()
    expect(getSeverity).toHaveBeenCalledTimes(2)
  })

  it('should throw and log if getFileContent fails', async () => {
    const error = new Error('GitHub error')
    getFileContent.mockRejectedValue(error)

    await expect(getRepoDependencyUpdates('bad-repo')).rejects.toThrow('GitHub error')
  })

  it('should classify updates as devDependencies when only found there', async () => {
    getFileContent.mockResolvedValue({
      dependencies: {},
      devDependencies: {
        eslint: '^7.0.0'
      }
    })

    ncu.run.mockResolvedValue({
      eslint: '^8.0.0'
    })

    const result = await getRepoDependencyUpdates('repo-dev-only')

    expect(result).toEqual({
      runtime: [],
      dev: [
        {
          name: 'eslint',
          current: '^7.0.0',
          latest: '^8.0.0',
          severity: 'mock-severity'
        }
      ]
    })

    expect(getSeverity).toHaveBeenCalledWith('^7.0.0', '^8.0.0')
  })
})
