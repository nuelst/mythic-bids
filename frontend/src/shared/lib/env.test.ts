import { API_URL } from './env'

describe('env', () => {
  it('exposes the API URL without a trailing slash', () => {
    expect(API_URL).toMatch(/^https?:\/\/.+[^/]$/)
  })
})
