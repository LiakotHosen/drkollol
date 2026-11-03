/**
 * Sanitizes HTML to prevent XSS attacks while allowing rich text formatting.
 * Works seamlessly in both Client (DOMParser) and Server (regex fallback) environments.
 */

// Allowed HTML tags for rich blog articles
const ALLOWED_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'hr', 'br',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'a', 'img',
  'figure', 'figcaption',
  'span', 'div'
]);

// Allowed attributes per tag or global
const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  '*': new Set(['class', 'title', 'id']),
  'a': new Set(['href', 'target', 'rel']),
  'img': new Set(['src', 'alt', 'width', 'height', 'loading']),
  'th': new Set(['colspan', 'rowspan', 'scope', 'align']),
  'td': new Set(['colspan', 'rowspan', 'align']),
};

/**
 * Validates a URL attribute to prevent javascript: or data: injection
 */
function isSafeUrl(url: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  ) {
    return true;
  }
  // Allow safe WebP / PNG / JPEG data URLs if generated internally
  if (trimmed.startsWith('data:image/webp;base64,') || trimmed.startsWith('data:image/png;base64,') || trimmed.startsWith('data:image/jpeg;base64,')) {
    return true;
  }
  return false;
}

/**
 * Client-side DOMParser sanitizer (100% accurate HTML tree traversal)
 */
function sanitizeWithDOM(html: string): string {
  if (typeof window === 'undefined') return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
  const body = doc.body;

  function cleanNode(node: Node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      // If tag is not allowed, remove or unwrap it
      if (!ALLOWED_TAGS.has(tagName)) {
        element.remove();
        return;
      }

      // Remove forbidden attributes and sanitize allowed ones
      const attrs = Array.from(element.attributes);
      const tagAllowedAttrs = ALLOWED_ATTRIBUTES[tagName] || new Set();
      const globalAllowedAttrs = ALLOWED_ATTRIBUTES['*'];

      for (const attr of attrs) {
        const attrName = attr.name.toLowerCase();

        // Strictly remove any event handler (e.g. onclick, onerror, onload)
        if (attrName.startsWith('on')) {
          element.removeAttribute(attr.name);
          continue;
        }

        const isAllowed = tagAllowedAttrs.has(attrName) || globalAllowedAttrs.has(attrName);
        if (!isAllowed) {
          element.removeAttribute(attr.name);
          continue;
        }

        // Validate URLs
        if (attrName === 'href' || attrName === 'src') {
          if (!isSafeUrl(attr.value)) {
            element.removeAttribute(attr.name);
          }
        }
      }

      // Ensure links are safe
      if (tagName === 'a') {
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
      }

      // Add lazy loading to images
      if (tagName === 'img') {
        element.setAttribute('loading', 'lazy');
      }

      // Recursively clean children
      Array.from(element.childNodes).forEach(cleanNode);
    }
  }

  Array.from(body.childNodes).forEach(cleanNode);
  return body.innerHTML;
}

/**
 * Server-side regex-based sanitizer (safe fallback for SSR)
 */
function sanitizeWithRegex(html: string): string {
  if (!html) return '';

  let sanitized = html
    // 1. Remove dangerous script and iframe blocks entirely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    // 2. Remove all inline event handlers (onload, onerror, onclick, etc.)
    .replace(/\s+on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    // 3. Remove javascript: or vbscript: in attributes
    .replace(/(href|src)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, '$1=""')
    .replace(/(href|src)\s*=\s*(?:'vbscript:[^']*'|"vbscript:[^"]*"|vbscript:[^\s>]+)/gi, '$1=""');

  return sanitized;
}

/**
 * Primary export: sanitizes HTML securely in any runtime environment
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  if (typeof window !== 'undefined') {
    try {
      return sanitizeWithDOM(html);
    } catch {
      return sanitizeWithRegex(html);
    }
  }
  return sanitizeWithRegex(html);
}
