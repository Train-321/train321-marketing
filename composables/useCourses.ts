/**
 * Sanity query helpers for courses.
 *
 * Pricing note: `course.price` from Sanity is the *display price*. If your LMS
 * has live pricing (promos, A/B tests, regional pricing), call useLivePricing()
 * client-side after the page renders — that way the static page still has SEO
 * and a baseline price, and the live number replaces it for the user.
 */

const COURSE_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  family,
  state,
  shortDescription,
  durationMinutes,
  price,
  image,
  accreditations,
  enrollUrl
`

export async function fetchAllCourses() {
  return useSanityQuery<any[]>(`*[_type == "course"] | order(title asc) { ${COURSE_FIELDS} }`).data
}

export async function fetchCourseBySlug(slug: string) {
  return useSanityQuery<any>(
    `*[_type == "course" && slug.current == $slug][0] {
      ${COURSE_FIELDS},
      longDescription,
      whatYouLearn,
      "seo": seo
    }`,
    { slug }
  ).data
}

export async function fetchCoursesByFamily(family: string) {
  return useSanityQuery<any[]>(
    `*[_type == "course" && family == $family] | order(title asc) { ${COURSE_FIELDS} }`,
    { family }
  ).data
}

/**
 * Optionally call your LMS API for the latest price for a course.
 * Keep this client-side so SSR/SSG output uses the Sanity baseline and Google
 * still indexes a real number.
 */
export async function useLivePricing(courseSlug: string) {
  const config = useRuntimeConfig()
  const { data } = await useFetch(`${config.public.apiBase}/courses/${courseSlug}/pricing`, {
    server: false,
    default: () => null
  })
  return data
}
