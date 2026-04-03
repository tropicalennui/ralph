const express = require('express');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { sanitiseFilename, cleanFragment, toMarkdown, buildFrontmatter } = require('./lib');

const app = express();
app.use(express.json({ limit: '10mb' }));

// Allow requests from the browser extension
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  next();
});
app.options('/capture', (req, res) => res.sendStatus(204));

const VAULT_PATH = path.resolve(__dirname, '../../../Documentation/Knowledge');

app.post('/capture', (req, res) => {
  const { html, title, url, is_fragment, debug_selector, source_folder } = req.body;

  if (!html) {
    return res.status(400).json({ error: 'No HTML content received' });
  }

  console.log(`[extension] selector: ${debug_selector}, fragment: ${is_fragment}`);

  let contentHtml, articleTitle;

  if (is_fragment) {
    const cleaned = cleanFragment(html, url, title);
    contentHtml = cleaned.html;
    articleTitle = cleaned.title;
  } else {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    console.log(`[readability] title: "${article?.title}", content length: ${article?.content?.length ?? 0}`);

    const readabilityOk = article?.content && article.content.length > 200;
    contentHtml = readabilityOk
      ? article.content
      : dom.window.document.body?.innerHTML ?? html;
    articleTitle = (readabilityOk ? article.title : null) ?? title ?? 'Untitled';
  }

  const markdown = toMarkdown(contentHtml);
  const date = new Date().toISOString().split('T')[0];
  const frontmatter = buildFrontmatter(articleTitle, url, date);
  const filename = sanitiseFilename(articleTitle) + '.md';

  const destDir = path.join(VAULT_PATH, 'Acquired', source_folder ?? 'Unknown');
  fs.mkdirSync(destDir, { recursive: true });
  const filepath = path.join(destDir, filename);

  try {
    fs.writeFileSync(filepath, frontmatter + `# ${articleTitle}\n\n` + markdown, 'utf8');
  } catch (err) {
    console.error('Write failed:', err);
    return res.status(500).json({ error: `Could not write file: ${err.message}` });
  }

  console.log(`[${new Date().toISOString()}] Saved: ${destDir}/${filename}`);
  res.json({ filename, filepath });
});

app.listen(3737, '127.0.0.1', () => {
  console.log('Page capture server → http://127.0.0.1:3737');
  console.log(`Vault target:        ${VAULT_PATH}`);
  console.log('Waiting for captures...\n');
});
