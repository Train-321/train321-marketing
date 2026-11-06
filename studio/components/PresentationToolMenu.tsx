import { type MouseEvent, useCallback } from 'react'
import { type ToolMenuProps, useClient } from 'sanity'
import { useRouter } from 'sanity/router'

// Pages with one document behind them. Keep in step with the site's routes.
const FIXED_PATHS: Record<string, string> = {
  siteSettings: '/',
  homePage: '/',
  contactPage: '/contact',
  demoPage: '/demo',
  servicesPage: '/services',
  aboutPage: '/about',
  faqPage: '/faq',
  catalogPage: '/catalog',
  blogIndexPage: '/blog',
  testimonialsPage: '/testimonials',
  testimonial: '/testimonials',
  faqItem: '/faq',
  teamMember: '/about'
}

const SLUG_PREFIXES: Record<string, string> = {
  course: '/courses/',
  blogPost: '/blog/',
  legalPage: '/legal/',
  service: '/services/'
}

function pagePath(doc: { _type: string; slug?: string }): string | undefined {
  if (FIXED_PATHS[doc._type]) return FIXED_PATHS[doc._type]
  return doc.slug && SLUG_PREFIXES[doc._type] ? SLUG_PREFIXES[doc._type] + doc.slug : undefined
}

// The rightmost Structure pane, e.g. /structure/course;course-food-handler.
// It may be a list rather than a document; the lookup below finds nothing then.
function rightmostPaneId(pathname: string): string | undefined {
  const panes = pathname.split('/structure/')[1]
  if (!panes) return undefined
  return decodeURIComponent(panes.split(';').pop()!.split(/[|,]/)[0])
}

/**
 * Sanity's Presentation tab always opens the preview's home page. An editor
 * looking at a course expects that course, so while a document is open in
 * Structure the tab goes where its "Used on N pages" link goes instead.
 */
export function PresentationToolMenu(props: ToolMenuProps) {
  const client = useClient({ apiVersion: '2025-01-01' })
  const router = useRouter()

  const openWithCurrentDocument = useCallback(
    async (event: MouseEvent<HTMLDivElement>) => {
      const link = (event.target as Element).closest('a')
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return

      const target = new URL(link.href).pathname
      const id = rightmostPaneId(window.location.pathname)
      if (!target.endsWith('/presentation') || !id) return

      event.preventDefault()
      event.stopPropagation()

      const doc = await client
        .fetch<{ _type: string; slug?: string } | null>(
          '*[_id in [$id, "drafts." + $id]][0]{ _type, "slug": slug.current }',
          { id }
        )
        .catch(() => null)
      const preview = doc && pagePath(doc)

      if (doc && preview) {
        router.navigateIntent('edit', {
          id,
          type: doc._type,
          mode: 'presentation',
          presentation: 'presentation',
          preview
        })
      } else {
        router.navigateUrl({ path: target })
      }
    },
    [client, router]
  )

  return (
    <div style={{ display: 'contents' }} onClickCapture={openWithCurrentDocument}>
      {props.renderDefault(props)}
    </div>
  )
}
