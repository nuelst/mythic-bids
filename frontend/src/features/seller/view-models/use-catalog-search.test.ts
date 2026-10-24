import { CATALOG_PAGE_SIZE, sliceCatalogPage } from './use-catalog-search'

describe('sliceCatalogPage', () => {
  const items = Array.from({ length: 20 }, (_, index) => index + 1)

  it('keeps eight items on the first page', () => {
    expect(sliceCatalogPage(items, 1)).toEqual({
      page: 1,
      total: 20,
      items: [1, 2, 3, 4, 5, 6, 7, 8],
    })
    expect(CATALOG_PAGE_SIZE).toBe(8)
  })

  it('clamps a page past the last results', () => {
    expect(sliceCatalogPage(items, 99).page).toBe(3)
    expect(sliceCatalogPage(items, 3).items).toEqual([17, 18, 19, 20])
  })
})
