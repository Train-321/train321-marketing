import {useCallback, useEffect, useMemo, useState} from 'react'
import {set, unset, type StringInputProps} from 'sanity'
import {Autocomplete, Box, Button, Card, Flex, Spinner, Stack, Text} from '@sanity/ui'

const API_URL = 'https://new-features-api.train321.com/course/public-list'

type Course = {id: number; name: string}

// Custom input for the course "enrollId" field. Fetches the live storefront
// course list from the Train321 API and lets the editor search + pick one,
// storing the course id (as a string) into the field. Falls back to manual
// entry if the API is unreachable.
export default function CoursePickerInput(props: StringInputProps) {
  const {value, onChange, elementProps} = props
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(API_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then((rows: Course[]) => {
        if (!cancelled) {
          setCourses(Array.isArray(rows) ? rows : [])
          setError(null)
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load courses')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const options = useMemo(
    () => courses.map((c) => ({value: String(c.id), name: c.name})),
    [courses],
  )

  const selected = useMemo(
    () => courses.find((c) => String(c.id) === value),
    [courses, value],
  )

  const handleChange = useCallback(
    (next: string | undefined) => {
      onChange(next ? set(next) : unset())
    },
    [onChange],
  )

  if (loading) {
    return (
      <Flex align="center" gap={2} paddingY={2}>
        <Spinner muted />
        <Text size={1} muted>
          Loading courses…
        </Text>
      </Flex>
    )
  }

  // API down — fall back to the plain text input so editors aren't blocked.
  if (error) {
    return (
      <Stack space={2}>
        <Card padding={3} radius={2} tone="caution" border>
          <Text size={1}>Couldn’t load the course list ({error}). Enter the course ID manually.</Text>
        </Card>
        <input
          {...elementProps}
          type="text"
          value={value || ''}
          onChange={(e) => handleChange(e.currentTarget.value || undefined)}
          style={{padding: '0.6rem', width: '100%', borderRadius: 4, border: '1px solid #ccc'}}
          placeholder="Course ID"
        />
      </Stack>
    )
  }

  return (
    <Stack space={3}>
      <Autocomplete
        id={elementProps.id}
        ref={elementProps.ref as never}
        options={options}
        value={value || ''}
        openButton
        placeholder="Search courses by name…"
        filterOption={(query, option) =>
          option.name.toLowerCase().includes(query.toLowerCase())
        }
        renderOption={(option) => (
          <Card as="button" padding={3} radius={2}>
            <Text size={1}>{option.name}</Text>
            <Box marginTop={1}>
              <Text size={0} muted>
                ID: {option.value}
              </Text>
            </Box>
          </Card>
        )}
        renderValue={(_value, option) => option?.name || _value}
        onChange={(next) => handleChange(next || undefined)}
      />
      {selected ? (
        <Card padding={3} radius={2} tone="positive" border>
          <Flex align="center" justify="space-between" gap={2}>
            <Text size={1}>
              Selected: <strong>{selected.name}</strong> (ID {selected.id})
            </Text>
            <Button
              mode="bleed"
              tone="critical"
              fontSize={1}
              padding={2}
              text="Clear"
              onClick={() => handleChange(undefined)}
            />
          </Flex>
        </Card>
      ) : value ? (
        <Card padding={3} radius={2} tone="caution" border>
          <Text size={1}>
            Stored ID <strong>{value}</strong> isn’t in the current storefront list. It may be
            inactive or removed.
          </Text>
        </Card>
      ) : null}
    </Stack>
  )
}
