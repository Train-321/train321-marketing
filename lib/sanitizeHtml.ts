/**
 * Server-safe sanitizer for admin-authored rich text from the LMS (course
 * overviews). Same policy as CourseModal's DOMParser version — drop executable
 * elements, inline event handlers and javascript: URLs — but regex-based so it
 * also runs during server rendering, where DOMParser doesn't exist. The input
 * comes from the client's own backend; this strips the actively dangerous
 * bits, it is not a general-purpose HTML sanitizer for untrusted input.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  let out = html;
  // Executable / embedding elements, with their content.
  out = out.replace(
    /<(script|style|iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
    ""
  );
  // Self-closing or unclosed variants, plus link/meta.
  out = out.replace(/<\/?(script|style|iframe|object|embed|form|link|meta)\b[^>]*>/gi, "");
  // Inline event handlers: onclick="…", onload='…', onerror=…
  out = out.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // javascript: URLs in href/src.
  out = out.replace(
    /\s+(href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi,
    ""
  );
  return out;
}
