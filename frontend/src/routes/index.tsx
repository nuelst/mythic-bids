import { createFileRoute } from '@tanstack/react-router'
import { ShowcasePage } from '#/features/showcase/pages/showcase-page'
import { showcaseQueryOptions } from '#/features/showcase/api/showcase-api'
import {
  toShowcaseQuery,
  validateShowcaseSearch,
} from '#/features/showcase/api/search'

export const Route = createFileRoute('/')({
  validateSearch: validateShowcaseSearch,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      showcaseQueryOptions(toShowcaseQuery(deps)),
    ),
  component: ShowcaseRoute,
})

function ShowcaseRoute() {
  return <ShowcasePage search={Route.useSearch()} />
}
