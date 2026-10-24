import { getAccessToken, getSession, setSession } from './session'

const user = {
  id: 'u1',
  name: 'Ana',
  email: 'ana@example.com',
  role: 'BIDDER' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('session', () => {
  afterEach(() => {
    setSession(null)
    localStorage.clear()
  })

  it('persists and restores the session', () => {
    setSession({ accessToken: 'tok', user })
    expect(getAccessToken()).toBe('tok')
    expect(JSON.parse(localStorage.getItem('mythic.session')!).user.name).toBe(
      'Ana',
    )
    expect(getSession()?.user.email).toBe('ana@example.com')
  })

  it('clears storage on logout', () => {
    setSession({ accessToken: 'tok', user })
    setSession(null)
    expect(getAccessToken()).toBeNull()
    expect(localStorage.getItem('mythic.session')).toBeNull()
  })
})
