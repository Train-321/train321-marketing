// Wrapper around @nuxtjs/sanity's useSanityQuery that returns a normal
// reactive ref to the GROQ result. The library wraps it as { data, sourceMap },
// which is awkward in pages — this hides that detail.
//
// Returns a thenable so callers can `await` it (which lets Nuxt auto-track
// the underlying useAsyncData promise) and still access `.data` / `.pending`
// synchronously without the extra wrapping layer.

import type { Ref } from 'vue'
import type { QueryParams } from '@nuxtjs/sanity'

function unwrap<T>(raw: unknown): T | null {
  if (raw == null) return null
  if (typeof raw === 'object' && raw !== null && 'data' in raw && 'sourceMap' in raw) {
    return (raw as { data: T }).data
  }
  return raw as T
}

export function useSanityFetch<T = unknown>(query: string, params?: QueryParams) {
  const res = useSanityQuery<T>(query, params)
  const data = computed<T | null>(() => unwrap<T>((res.data as Ref<unknown>).value))
  const pending = res.pending as Ref<boolean>
  const ret = { data, pending }
  // Mirror the underlying promise so callers can `await` and Nuxt waits on the data.
  return Object.assign(res.then(() => ret), ret)
}
