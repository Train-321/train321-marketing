import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

let cachedBuilder: ReturnType<typeof imageUrlBuilder> | null = null

function getBuilder() {
  if (cachedBuilder) return cachedBuilder
  const config = useRuntimeConfig()
  const sanity = useSanity()
  cachedBuilder = imageUrlBuilder({
    projectId: (sanity.client.config().projectId as string) || (config.public as any).sanityProjectId,
    dataset: (sanity.client.config().dataset as string) || 'production'
  })
  return cachedBuilder
}

/**
 * Build a CDN URL for a Sanity image. Chain `.width()`, `.height()`, `.fit()`, etc.
 *
 * Example:
 *   <img :src="urlFor(course.image).width(800).fit('max').url()" />
 */
export function urlFor(source: SanityImageSource) {
  return getBuilder().image(source)
}
