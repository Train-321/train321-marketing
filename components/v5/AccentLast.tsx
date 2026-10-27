// Studio headings are plain strings, but every v5 h2 ends on the italic
// accent. Wrapping the last word keeps that look on editor-written copy.

export default function AccentLast({ text }: { text: string }) {
  const t = text.trim();
  const cut = t.lastIndexOf(" ");
  if (cut < 0) return <em>{t}</em>;
  return (
    <>
      {t.slice(0, cut)} <em>{t.slice(cut + 1)}</em>
    </>
  );
}
