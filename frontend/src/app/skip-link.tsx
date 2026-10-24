import { m } from '#/paraglide/messages'

export function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      {m.skip_to_content()}
    </a>
  )
}
