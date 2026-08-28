import {useCallback, useEffect, useRef, useState} from 'react'
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Spinner,
  Stack,
  Text,
  TextInput,
} from '@sanity/ui'
import {SearchIcon} from '@sanity/icons'
import type {AssetSource, AssetSourceComponentProps, ImageAsset} from 'sanity'

// Browser-exposed by design: Vite only inlines SANITY_STUDIO_* vars, so this
// key ships in the Studio bundle. Pexels keys are read-only and rate-limited,
// and the Studio itself sits behind Sanity auth — but treat the key as public
// and rotate it at pexels.com/api rather than reusing a secret from elsewhere.
const API_KEY = process.env.SANITY_STUDIO_PEXELS_API_KEY || ''
const PER_PAGE = 24

type PexelsPhoto = {
  id: number
  alt: string
  width: number
  height: number
  avg_color: string | null
  url: string
  photographer: string
  photographer_url: string
  src: {original: string; large2x: string; large: string; medium: string; tiny: string}
}

/**
 * "Pexels" tab in the Studio image picker — the same stock-photo search the
 * LMS has, so editors can fill a course hero without leaving the document.
 *
 * Picking a photo hands Sanity a `kind: 'url'` asset: Sanity fetches the file
 * and stores it as a normal image asset. That matters because the course GROQ
 * projects `image.asset->url` — a Pexels photo has to become a real asset to
 * reach the page, not stay a remote link.
 */
function PexelsAssetSourceComponent(props: AssetSourceComponentProps) {
  const {onSelect, onClose} = props
  const [query, setQuery] = useState('')
  const [photos, setPhotos] = useState<PexelsPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [picking, setPicking] = useState<number | null>(null)
  // Bumped per request so a slow earlier search can't overwrite a newer one.
  const requestRef = useRef(0)

  const run = useCallback(async (term: string) => {
    if (!API_KEY) {
      setError('No Pexels API key configured. Add SANITY_STUDIO_PEXELS_API_KEY to the Studio env and restart it.')
      return
    }
    const id = ++requestRef.current
    setLoading(true)
    setError(null)
    // An empty box shows Pexels' curated feed rather than nothing at all.
    const url = term.trim()
      ? `https://api.pexels.com/v1/search?per_page=${PER_PAGE}&query=${encodeURIComponent(term.trim())}`
      : `https://api.pexels.com/v1/curated?per_page=${PER_PAGE}`
    try {
      const res = await fetch(url, {headers: {Authorization: API_KEY}})
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? 'Pexels rejected the API key.'
            : res.status === 429
              ? 'Pexels rate limit reached — wait a minute and try again.'
              : `Pexels error (HTTP ${res.status}).`,
        )
      }
      const body = await res.json()
      if (id !== requestRef.current) return
      setPhotos(Array.isArray(body?.photos) ? body.photos : [])
    } catch (e) {
      if (id !== requestRef.current) return
      setError(e instanceof Error ? e.message : 'Could not reach Pexels.')
      setPhotos([])
    } finally {
      if (id === requestRef.current) setLoading(false)
    }
  }, [])

  // Curated feed on open, so the panel is never an empty box.
  useEffect(() => {
    void run('')
  }, [run])

  const choose = useCallback(
    (photo: PexelsPhoto) => {
      setPicking(photo.id)
      onSelect([
        {
          kind: 'url',
          // large2x (~1880px wide) covers the hero at retina without pulling
          // the multi-megabyte original through the asset pipeline.
          value: photo.src.large2x,
          // Typed as a complete ImageAsset, but the fields it insists on
          // (assetId, url, metadata, …) are exactly the ones the server fills
          // in on upload. Only the editable metadata is ours to send.
          assetDocumentProps: {
            _type: 'sanity.imageAsset',
            originalFilename: `pexels-${photo.photographer.replace(/\s+/g, '-').toLowerCase()}-${photo.id}.jpg`,
            source: {name: 'pexels', id: String(photo.id), url: photo.url},
            description: photo.alt || '',
            // Pexels' license doesn't require credit, but the photographer is
            // worth keeping on the asset for anyone who wants to give it.
            creditLine: `${photo.photographer} on Pexels`,
          } as unknown as ImageAsset,
        },
      ])
    },
    [onSelect],
  )

  return (
    <Dialog
      id="pexels-asset-source"
      header="Search Pexels"
      onClose={onClose}
      width={3}
      __unstable_autoFocus={false}
    >
      <Box padding={4}>
        <Stack space={4}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void run(query)
            }}
          >
            <Flex gap={2}>
              <Box flex={1}>
                <TextInput
                  value={query}
                  autoFocus
                  icon={SearchIcon}
                  placeholder="bartender, restaurant kitchen, food safety…"
                  onChange={(e) => setQuery(e.currentTarget.value)}
                />
              </Box>
              <Button type="submit" text="Search" tone="primary" disabled={loading} />
            </Flex>
          </form>

          {error && (
            <Card padding={3} radius={2} tone="critical">
              <Text size={1}>{error}</Text>
            </Card>
          )}

          {loading && (
            <Flex align="center" justify="center" padding={5} gap={3}>
              <Spinner muted />
              <Text size={1} muted>
                Searching Pexels…
              </Text>
            </Flex>
          )}

          {!loading && !error && photos.length === 0 && (
            <Flex align="center" justify="center" padding={5}>
              <Text size={1} muted>
                No photos matched that search.
              </Text>
            </Flex>
          )}

          {!loading && photos.length > 0 && (
            <Grid columns={[2, 3, 4]} gap={3}>
              {photos.map((photo) => (
                <Card
                  key={photo.id}
                  as="button"
                  type="button"
                  radius={2}
                  overflow="hidden"
                  tone="transparent"
                  disabled={picking !== null}
                  onClick={() => choose(photo)}
                  style={{
                    cursor: picking === null ? 'pointer' : 'wait',
                    padding: 0,
                    border: 'none',
                    opacity: picking !== null && picking !== photo.id ? 0.4 : 1,
                  }}
                >
                  <Stack space={2}>
                    <img
                      src={photo.src.medium}
                      alt={photo.alt || ''}
                      loading="lazy"
                      style={{
                        display: 'block',
                        width: '100%',
                        aspectRatio: '4 / 3',
                        objectFit: 'cover',
                        background: photo.avg_color || '#eee',
                      }}
                    />
                    <Box paddingX={2} paddingBottom={2}>
                      <Text size={0} muted textOverflow="ellipsis">
                        {picking === photo.id ? 'Adding…' : photo.photographer}
                      </Text>
                    </Box>
                  </Stack>
                </Card>
              ))}
            </Grid>
          )}

          <Text size={0} muted>
            Photos from Pexels — free to use, no attribution required.
          </Text>
        </Stack>
      </Box>
    </Dialog>
  )
}

export const pexelsAssetSource: AssetSource = {
  name: 'pexels',
  title: 'Pexels',
  icon: SearchIcon,
  component: PexelsAssetSourceComponent,
}
