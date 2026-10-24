import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const LOT_ID = '11111111-1111-4111-8111-111111111111'
const API = 'http://127.0.0.1:3999'

async function login(page: Page, email: string) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Palavra-passe').fill('demo1234')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('/')
}

test.beforeEach(async ({ request }) => {
  await request.post(`${API}/e2e/reset`)
})

test('login, bid, outbid, close and open the receipt', async ({ browser }) => {
  const ana = await browser.newContext()
  const bruno = await browser.newContext()
  const anaPage = await ana.newPage()
  const brunoPage = await bruno.newPage()

  await login(anaPage, 'ana@demo.com')
  await login(brunoPage, 'bruno@demo.com')

  await anaPage.goto(`/lots/${LOT_ID}`)
  await expect(anaPage.getByRole('heading', { name: 'Sol Ring' })).toBeVisible()
  await anaPage.getByRole('button', { name: 'Dar lance' }).click()
  await expect(anaPage.getByText('Estás a ganhar')).toBeVisible()

  await brunoPage.goto(`/lots/${LOT_ID}`)
  await brunoPage.getByRole('button', { name: 'Dar lance' }).click()
  await expect(brunoPage.getByText('Estás a ganhar')).toBeVisible()
  await expect(anaPage.getByText(/Foste superado ·/)).toBeVisible()

  await anaPage.request.post(`${API}/e2e/close`)
  await expect(brunoPage.getByText(/Vendido a B-BRUNO/)).toBeVisible()

  await brunoPage.getByRole('link', { name: 'Ver os meus arremates' }).click()
  await expect(
    brunoPage.getByRole('heading', { name: 'Venceste' }),
  ).toBeVisible()
  await brunoPage.getByRole('link', { name: 'Ver comprovante' }).click()
  await expect(brunoPage.getByText('Selo válido')).toBeVisible()
  await expect(brunoPage.getByText('Cadeia íntegra')).toBeVisible()

  await ana.close()
  await bruno.close()
})
