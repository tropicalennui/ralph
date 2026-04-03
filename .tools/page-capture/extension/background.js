chrome.action.onClicked.addListener(async (tab) => {

  let pageData;
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Collect ALL elements matching a selector, piercing shadow roots.
        // Returns them sorted by text length descending so the richest
        // match (main content) wins over sidebars with the same class name.
        function queryDeepAll(selector, root, results = []) {
          root.querySelectorAll(selector).forEach(el => results.push(el));
          for (const child of root.querySelectorAll('*')) {
            if (child.shadowRoot) {
              queryDeepAll(selector, child.shadowRoot, results);
            }
          }
          return results;
        }

        // Site-specific config, matched by URL prefix.
        // Each entry defines the friendly folder name and selectors for that site.
        // Add a new entry to support a new site without affecting existing ones.
        const SITE_CONFIGS = [
          {
            match: 'https://developer.servicenow.com/dev.do#!/learn/courses',
            folder: 'ServiceNow Developer Learn',
            selectors: ['.dps-learn-module-content', '.dps-learn-module-panel'],
          },
        ];

        // Generic selectors used when no site config matches.
        const GENERIC_SELECTORS = [
          'main',
          'article',
          '[role="main"]',
          '#content',
          '.content',
          '.article-content',
          '.page-content',
        ];

        const siteConfig = SITE_CONFIGS.find(s => window.location.href.startsWith(s.match));
        const candidates = siteConfig
          ? [...siteConfig.selectors, ...GENERIC_SELECTORS]
          : GENERIC_SELECTORS;
        const sourceFolder = siteConfig?.folder ?? window.location.hostname;

        for (const selector of candidates) {
          const matches = queryDeepAll(selector, document)
            .sort((a, b) => b.innerText.trim().length - a.innerText.trim().length);

          const el = matches[0];
          if (el && el.innerText.trim().length > 300) {
            console.log(`[capture] matched: ${selector} (${matches.length} found), length: ${el.innerText.trim().length}`);
            return {
              html: el.innerHTML,
              title: document.title,
              url: window.location.href,
              source_folder: sourceFolder,
              debug_selector: selector,
              is_fragment: true,
            };
          }
        }

        console.log('[capture] no selector matched, sending full document');
        return {
          html: document.documentElement.outerHTML,
          title: document.title,
          url: window.location.href,
          source_folder: sourceFolder,
          debug_selector: 'full document',
          is_fragment: false,
        };
      },
    });
    pageData = results[0].result;
  } catch (err) {
    console.error('Failed to extract page:', err);
    return;
  }

  let message, success;
  try {
    const response = await fetch('http://localhost:3737/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pageData),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    message = `Saved: ${data.filename}`;
    success = true;
  } catch (err) {
    message = `Capture failed: ${err.message}`;
    success = false;
  }

  // Inject a toast notification into the page
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (msg, ok) => {
      const existing = document.getElementById('__vault-capture-toast__');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.id = '__vault-capture-toast__';
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 2147483647;
        background: ${ok ? '#2e7d32' : '#c62828'};
        color: #fff;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-family: system-ui, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,.35);
        opacity: 1;
        transition: opacity .4s ease;
        pointer-events: none;
        max-width: 360px;
        word-break: break-word;
      `;
      toast.textContent = msg;
      document.body.appendChild(toast);
      setTimeout(() => (toast.style.opacity = '0'), 2500);
      setTimeout(() => toast.remove(), 3000);
    },
    args: [message, success],
  });
});
