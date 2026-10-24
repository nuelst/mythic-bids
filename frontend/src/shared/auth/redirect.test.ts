import { isPrivatePath, safeRedirect } from './redirect'

describe('safeRedirect', () => {
  it('keeps same-origin relative paths', () => {
    expect(safeRedirect('/wallet')).toBe('/wallet')
    expect(safeRedirect('/me/bids?page=2')).toBe('/me/bids?page=2')
  })

  it('rejects open redirects', () => {
    expect(safeRedirect('https://evil.test')).toBeUndefined()
    expect(safeRedirect('//evil.test')).toBeUndefined()
    expect(safeRedirect('login')).toBeUndefined()
    expect(safeRedirect(1)).toBeUndefined()
  })
})

describe('isPrivatePath', () => {
  it('matches the private areas', () => {
    expect(isPrivatePath('/wallet')).toBe(true)
    expect(isPrivatePath('/me/bids')).toBe(true)
    expect(isPrivatePath('/seller/new')).toBe(true)
    expect(isPrivatePath('/')).toBe(false)
    expect(isPrivatePath('/login')).toBe(false)
  })
})
