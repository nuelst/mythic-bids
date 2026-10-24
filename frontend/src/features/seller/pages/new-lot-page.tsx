import { useState } from 'react'
import { m } from '#/paraglide/messages'
import { BackLink } from '#/shared/ui/back-link'
import { Card, CardContent, CardHeader, CardTitle } from '#/shared/ui/card'
import { CatalogResults } from '../components/catalog-results'
import { CatalogSearch } from '../components/catalog-search'
import { CreateLotForm } from '../components/create-lot-form'
import { useCatalogSearch } from '../view-models/use-catalog-search'
import type { CatalogItem } from '../api/seller-api'

export function NewLotPage() {
  const search = useCatalogSearch()
  const [item, setItem] = useState<CatalogItem>()

  return (
    <main className="container-page grid gap-8 py-10">
      <div className="grid gap-2">
        <BackLink to="/seller" label={m.seller_back()} />
        <h1 className="font-display text-4xl font-bold">{m.seller_new()}</h1>
        <p className="text-muted-foreground">{m.seller_new_description()}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <section className="grid gap-4">
          <CatalogSearch draft={search.draft} onDraft={search.setDraft} />
          {search.isOffline && (
            <p
              role="status"
              className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning"
            >
              {m.seller_offline()}
            </p>
          )}
          {search.enabled && search.isError && (
            <p className="text-sm text-danger">{m.seller_search_error()}</p>
          )}
          <CatalogResults
            data={search.data}
            items={search.items}
            fetching={search.isFetching}
            page={search.page}
            pageSize={search.pageSize}
            total={search.total}
            onPageChange={search.setPage}
            selectedId={item?.id}
            onSelect={setItem}
          />
        </section>
        <Card>
          <CardHeader>
            <CardTitle>{item ? item.name : m.seller_terms_title()}</CardTitle>
          </CardHeader>
          <CardContent>
            {item && (
              <p className="mb-4 text-sm text-muted-foreground">
                {item.setName} · {item.lang}
              </p>
            )}
            <CreateLotForm itemId={item?.id} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
