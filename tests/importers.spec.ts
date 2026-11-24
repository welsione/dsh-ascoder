import { describe, it, expect } from 'vitest'
import { normalizeBase, buildAuthHeaders } from '../src/importers.js'

describe('import base normalisation', () => {
  it('accepts Bitbucket page urls and reduces them to the origin', () => {
    expect(normalizeBase('https://bitbucket.example.com/dashboard', 'bitbucket')).toBe('https://bitbucket.example.com')
    expect(normalizeBase('https://bitbucket.example.com/projects/CL', 'bitbucket')).toBe('https://bitbucket.example.com')
    expect(normalizeBase('bitbucket.example.com', 'bitbucket')).toBe('https://bitbucket.example.com')
  })

  it('maps github.com and enterprise hosts to API roots', () => {
    expect(normalizeBase('https://github.com/orgs/acme/repos', 'github')).toBe('https://api.github.com')
    expect(normalizeBase('https://api.github.com', 'github')).toBe('https://api.github.com')
    expect(normalizeBase('https://ghe.example.com', 'github')).toBe('https://ghe.example.com/api/v3')
  })

  it('rejects empty or non-http input', () => {
    expect(() => normalizeBase('', 'bitbucket')).toThrow()
    expect(() => normalizeBase('ftp://host', 'bitbucket')).toThrow()
    expect(normalizeBase('http://localhost:8080', 'bitbucket')).toBe('http://localhost:8080')
  })
})

describe('import auth headers', () => {
  it('uses basic auth when a username is present', () => {
    const headers = buildAuthHeaders({ username: 'me', password: 'token' })
    expect(headers.authorization).toBe('Basic ' + Buffer.from('me:token').toString('base64'))
  })

  it('falls back to bearer for token-only credentials', () => {
    expect(buildAuthHeaders({ username: '', password: 'tok' }).authorization).toBe('Bearer tok')
  })
})
