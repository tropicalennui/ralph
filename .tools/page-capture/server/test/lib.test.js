const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { sanitiseFilename, cleanFragment, buildFrontmatter } = require('../lib');

describe('sanitiseFilename', () => {
  test('strips characters illegal in filenames', () => {
    assert.equal(sanitiseFilename('Hello: World / Test'), 'Hello World Test');
  });

  test('strips pipe and quote characters', () => {
    assert.equal(sanitiseFilename('Exercise | ServiceNow "Developer"'), 'Exercise ServiceNow Developer');
  });

  test('collapses multiple spaces', () => {
    assert.equal(sanitiseFilename('Too   Many   Spaces'), 'Too Many Spaces');
  });

  test('truncates to 100 characters', () => {
    const long = 'A'.repeat(150);
    assert.equal(sanitiseFilename(long).length, 100);
  });

  test('returns timestamp fallback for empty title', () => {
    const result = sanitiseFilename('');
    assert.match(result, /^capture-\d+$/);
  });

  test('returns timestamp fallback when title is only illegal chars', () => {
    const result = sanitiseFilename(':/\\|?*');
    assert.match(result, /^capture-\d+$/);
  });
});

describe('cleanFragment', () => {
  test('removes data: URI images', () => {
    const html = '<p>Hello</p><img src="data:image/png;base64,abc123">';
    const { html: cleaned } = cleanFragment(html, 'https://example.com', 'Test');
    assert.doesNotMatch(cleaned, /data:image/);
  });

  test('makes relative image URLs absolute', () => {
    const html = '<img src="images/photo.png">';
    const { html: cleaned } = cleanFragment(html, 'https://example.com/docs/', 'Test');
    assert.match(cleaned, /https:\/\/example\.com\/docs\/images\/photo\.png/);
  });

  test('uses provided title when present', () => {
    const html = '<h1>Page Heading</h1><p>Content</p>';
    const { title } = cleanFragment(html, 'https://example.com', 'Provided Title');
    assert.equal(title, 'Provided Title');
  });

  test('falls back to h1 when title is empty', () => {
    const html = '<h1>Page Heading</h1><p>Content</p>';
    const { title } = cleanFragment(html, 'https://example.com', '');
    assert.equal(title, 'Page Heading');
  });

  test('falls back to Untitled when no title or heading', () => {
    const html = '<p>Just some content</p>';
    const { title } = cleanFragment(html, 'https://example.com', '');
    assert.equal(title, 'Untitled');
  });
});

describe('buildFrontmatter', () => {
  test('produces valid YAML frontmatter block', () => {
    const result = buildFrontmatter('My Title', 'https://example.com', '2026-04-03');
    assert.match(result, /^---\n/);
    assert.match(result, /title: "My Title"/);
    assert.match(result, /source: "https:\/\/example\.com"/);
    assert.match(result, /captured: 2026-04-03/);
    assert.match(result, /---\n\n$/);
  });

  test('escapes double quotes in title', () => {
    const result = buildFrontmatter('Title with "quotes"', 'https://example.com', '2026-04-03');
    assert.match(result, /title: "Title with 'quotes'"/);
  });
});
