import { sanitizeHtml } from './sanitize-html';

/**
 * Checks whether a string is pure rendered HTML (e.g. from rich text editor)
 * or still contains unparsed Markdown constructs (headings, lists, hr dividers, tables, etc.).
 */
export function isHtmlString(str?: string | null): boolean {
  if (!str) return false;
  const trimmed = str.trim();
  if (!trimmed) return false;

  // If it has markdown headings, hr dividers, lists, tables, or blockquotes, it's not pure HTML
  const hasMarkdownConstructs =
    /(?:^|\n)#{1,6}\s+/.test(trimmed) ||
    /(?:^|\n)\s*(\-{3,}|\*{3,}|_{3,})\s*(?:\n|$)/.test(trimmed) ||
    /(?:^|\n)\s*[-*]\s+\S+/.test(trimmed) ||
    /(?:^|\n)\s*\d+\.\s+\S+/.test(trimmed) ||
    /(?:^|\n)\s*>\s+/.test(trimmed) ||
    /(?:^|\n)\s*\|[^\n]+\|\s*(?:\n|$)/.test(trimmed);

  if (hasMarkdownConstructs) {
    return false;
  }

  // Otherwise check if it has standard HTML tags
  return /<(p|h[1-6]|ul|ol|li|blockquote|table|div|section|hr|article)[^>]*>/i.test(trimmed);
}

/**
 * Safely converts Markdown formatted text into clean, semantic HTML.
 * Handles headings (h1-h4), blockquotes, horizontal rules, bullet/numbered lists,
 * tables, inline styles (bold, italic, code, links), and multi-paragraph layout.
 */
export function markdownToHtml(markdown?: string | null): string {
  if (!markdown) return '';

  const raw = markdown.trim();
  if (!raw) return '';

  // If already rich HTML, just sanitize and return
  if (isHtmlString(raw)) {
    return sanitizeHtml(raw);
  }

  // 1. Normalize line endings (CRLF -> LF)
  let text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Normalize headings: ensure headings have proper blank lines around them
  // so that single-line headings don't swallow subsequent paragraphs
  text = text.replace(/^((?:#{1,6})\s+[^\n]+)$/gm, '\n\n$1\n\n');

  // 3. Normalize horizontal rules (---, ***, ___)
  text = text.replace(/^(\-{3,}|\*{3,}|_{3,})$/gm, '\n\n<hr />\n\n');

  // 4. Normalize blockquotes
  text = text.replace(/^((?:>[^\n]*\n?)+)/gm, '\n\n$1\n\n');

  // 5. Normalize tables
  text = text.replace(/^((?:\|[^\n]*\|\n?)+)/gm, '\n\n$1\n\n');

  // 6. Separate list start from preceding non-list line
  text = text.replace(/^([^-\n*0-9][^\n]*)\n(?=[-*\d]\s+|\d+\.\s+)/gm, '$1\n\n');

  // 7. Separate list end from following non-list line
  text = text.replace(/^([-*]\s+[^\n]*|\d+\.\s+[^\n]*)\n(?=[^-\n*0-9])/gm, '$1\n\n');

  // Inline formatting helper
  const formatInline = (str: string): string => {
    return str
      // Bold + Italic (***text*** or ___text___)
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      // Bold (**text** or __text__)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      // Italic (*text* or _text_)
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      // Inline Code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  };

  // Split into discrete blocks
  const rawBlocks = text.split(/\n{2,}/);
  const htmlParts: string[] = [];

  for (let block of rawBlocks) {
    block = block.trim();
    if (!block) continue;

    // Horizontal Rule
    if (block === '<hr />' || /^(\-{3,}|\*{3,}|_{3,})$/.test(block)) {
      htmlParts.push('<hr />');
      continue;
    }

    // Heading H1
    if (/^#\s+/.test(block)) {
      const heading = block.replace(/^#\s+/, '').trim();
      htmlParts.push(`<h1>${formatInline(heading)}</h1>`);
      continue;
    }

    // Heading H2
    if (/^##\s+/.test(block)) {
      const heading = block.replace(/^##\s+/, '').trim();
      htmlParts.push(`<h2>${formatInline(heading)}</h2>`);
      continue;
    }

    // Heading H3
    if (/^###\s+/.test(block)) {
      const heading = block.replace(/^###\s+/, '').trim();
      htmlParts.push(`<h3>${formatInline(heading)}</h3>`);
      continue;
    }

    // Heading H4
    if (/^####\s+/.test(block)) {
      const heading = block.replace(/^####\s+/, '').trim();
      htmlParts.push(`<h4>${formatInline(heading)}</h4>`);
      continue;
    }

    // Blockquote (> )
    if (block.startsWith('>')) {
      const quoteText = block
        .split('\n')
        .map((line) => line.replace(/^>\s*/, '').trim())
        .join(' ');
      htmlParts.push(`<blockquote><p>${formatInline(quoteText)}</p></blockquote>`);
      continue;
    }

    // Markdown Table (| col1 | col2 |)
    if (block.startsWith('|') && block.includes('\n')) {
      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      // Exclude divider row |---|---|
      const rows = lines.filter((l) => !/^\|[\s\-:|]+\|$/.test(l));

      if (rows.length > 0) {
        let tableHtml = '<table>';
        // First row as table header
        const headerCells = rows[0]
          .split('|')
          .filter(Boolean)
          .map((c) => c.trim());
        tableHtml += '<thead><tr>';
        for (const c of headerCells) {
          tableHtml += `<th>${formatInline(c)}</th>`;
        }
        tableHtml += '</tr></thead>';

        // Remaining rows as table body
        if (rows.length > 1) {
          tableHtml += '<tbody>';
          for (let r = 1; r < rows.length; r++) {
            const cells = rows[r]
              .split('|')
              .filter(Boolean)
              .map((c) => c.trim());
            tableHtml += '<tr>';
            for (const c of cells) {
              tableHtml += `<td>${formatInline(c)}</td>`;
            }
            tableHtml += '</tr>';
          }
          tableHtml += '</tbody>';
        }
        tableHtml += '</table>';
        htmlParts.push(tableHtml);
        continue;
      }
    }

    // Unordered List (- or *)
    if (/^[-*]\s+/.test(block)) {
      const items = block
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => /^[-*]\s+/.test(l))
        .map((l) => l.replace(/^[-*]\s+/, '').trim());

      if (items.length > 0) {
        let ulHtml = '<ul>';
        for (const it of items) {
          ulHtml += `<li>${formatInline(it)}</li>`;
        }
        ulHtml += '</ul>';
        htmlParts.push(ulHtml);
        continue;
      }
    }

    // Ordered List (1. 2. 3.)
    if (/^\d+\.\s+/.test(block)) {
      const items = block
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => /^\d+\.\s+/.test(l))
        .map((l) => l.replace(/^\d+\.\s+/, '').trim());

      if (items.length > 0) {
        let olHtml = '<ol>';
        for (const it of items) {
          olHtml += `<li>${formatInline(it)}</li>`;
        }
        olHtml += '</ol>';
        htmlParts.push(olHtml);
        continue;
      }
    }

    // Standard paragraph with line break preservation
    const paragraphText = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .join(' ');

    if (paragraphText) {
      htmlParts.push(`<p>${formatInline(paragraphText)}</p>`);
    }
  }

  const combined = htmlParts.join('\n');
  return sanitizeHtml(combined);
}
