/**
 * Pure functions extracted from server.js for testability.
 */

const { JSDOM } = require('jsdom');
const TurndownService = require('turndown');
const { gfm } = require('turndown-plugin-gfm');

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
td.use(gfm);
td.remove(['script', 'style', 'noscript', 'nav', 'footer', 'header']);

/**
 * Sanitises a page title into a safe filename (without extension).
 * Returns a timestamp-based fallback if the result would be empty.
 */
function sanitiseFilename(title) {
  const sanitised = (title ?? '')
    .replace(/[<>:"/\\|?*\n\r]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100);
  return sanitised || `capture-${Date.now()}`;
}

/**
 * Cleans a fragment of HTML before markdown conversion:
 * - Removes data: URI images (base64 icons)
 * - Makes relative image URLs absolute using the source URL
 * Returns { html, title } where title is extracted from h1/h2 if not provided.
 */
function cleanFragment(html, sourceUrl, providedTitle) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  doc.querySelectorAll('img[src^="data:"]').forEach(el => el.remove());
  doc.querySelectorAll('img[src]').forEach(el => {
    const src = el.getAttribute('src');
    if (src && !src.startsWith('http')) {
      try { el.setAttribute('src', new URL(src, sourceUrl).href); } catch (_) {}
    }
  });

  const h1 = doc.querySelector('h1, h2');
  const title = (providedTitle && providedTitle.trim()) || h1?.textContent?.trim() || 'Untitled';

  return { html: doc.body.innerHTML, title };
}

/**
 * Converts an HTML string to Markdown.
 */
function toMarkdown(html) {
  return td.turndown(html);
}

/**
 * Builds the YAML frontmatter block for a captured page.
 */
function buildFrontmatter(title, sourceUrl, date) {
  return [
    '---',
    `title: "${title.replace(/"/g, "'")}"`,
    `source: "${sourceUrl}"`,
    `captured: ${date}`,
    '---',
    '',
    '',
  ].join('\n');
}

module.exports = { sanitiseFilename, cleanFragment, toMarkdown, buildFrontmatter };
