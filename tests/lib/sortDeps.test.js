import { describe, it, expect } from 'vitest'
import { sortDeps } from '../../lib/sortDeps.js'

const deps = [
  { name: 'alpha', severity: 'medium' },
  { name: 'bravo', severity: 'high' },
  { name: 'charlie', severity: 'low' },
  { name: 'delta', severity: 'unknown' }
]

describe('sortDeps', () => {
  it('sorts by name ascending by default', () => {
    const result = sortDeps(deps)
    expect(result.map(d => d.name)).toEqual(['alpha', 'bravo', 'charlie', 'delta'])
  })

  it('sorts by name descending', () => {
    const result = sortDeps(deps, 'name', 'desc')
    expect(result.map(d => d.name)).toEqual(['delta', 'charlie', 'bravo', 'alpha'])
  })

  it('sorts by severity ascending', () => {
    const result = sortDeps(deps, 'severity', 'asc')
    expect(result.map(d => d.severity)).toEqual(['high', 'medium', 'low', 'unknown'])
  })

  it('sorts by severity descending', () => {
    const result = sortDeps(deps, 'severity', 'desc')
    expect(result.map(d => d.severity)).toEqual(['unknown', 'low', 'medium', 'high'])
  })
})
