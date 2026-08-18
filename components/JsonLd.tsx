// Renders a schema.org JSON-LD block. Server component; the payload is
// build-time data (never user input), so the inline script is safe.
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
