import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { login } from '../api/session-api'
import { LoginForm } from './login-form'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('../api/session-api', () => ({
  login: vi.fn(),
}))

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <LoginForm />
    </QueryClientProvider>,
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.mocked(login).mockReset()
  })

  it('blocks submit until the email and password are valid', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(login).not.toHaveBeenCalled()
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
  })

  it('sends a valid login to the API', async () => {
    vi.mocked(login).mockResolvedValue({
      accessToken: 'tok',
      user: {
        id: 'u1',
        name: 'Ana',
        email: 'ana@demo.com',
        role: 'BIDDER',
        createdAt: '2026-10-24T00:00:00.000Z',
      },
    })
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByLabelText('E-mail'), 'ana@demo.com')
    await user.type(screen.getByLabelText('Palavra-passe'), 'demo1234')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(vi.mocked(login).mock.calls[0]?.[0]).toEqual({
      email: 'ana@demo.com',
      password: 'demo1234',
    })
  })
})
