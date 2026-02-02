const { chromium } = require('playwright');
const fs = require('fs');

const hosts = ['http://127.0.0.1:5173/', 'http://localhost:5173/', 'http://127.0.0.1:5174/', 'http://localhost:5174/','http://127.0.0.1:5175/','http://localhost:5175/'];

(async () => {
  const results = [];
  for (const url of hosts) {
    const logs = [];
    let browser;
    try {
      browser = await chromium.launch();
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();

      page.on('console', (msg) => logs.push(`${msg.type()}: ${msg.text()}`));
      page.on('pageerror', (err) => logs.push(`pageerror: ${err.message}\n${err.stack}`));
      page.on('response', (resp) => logs.push(`response: ${resp.status()} ${resp.url()}`));

      try {
        await page.goto(url, { waitUntil: 'load', timeout: 5000 });
        logs.push(`goto-success: ${url}`);
        await page.waitForTimeout(500);
        const errEl = await page.$('text=Something went wrong');
        let detailsText = '';
        if (errEl) {
          const details = await page.$('details');
          if (details) detailsText = (await page.evaluate((d) => d.innerText, details)) || '';
        }

        await page.screenshot({ path: `public/videos/error-screenshot-${url.replace(/[:\/]/g,'_')}.png`, fullPage: true });
        results.push({ url, logs, detailsText, ok: true });
      } catch (err) {
        logs.push(`goto-error: ${err.message}`);
        results.push({ url, logs, detailsText: '', ok: false });
      }

      try { if (browser) await browser.close(); } catch(e) {}
    } catch (err) {
      results.push({ url, logs, detailsText: '', ok: false, error: err.message });
      try { if (browser) await browser.close(); } catch(e) {}
    }
  }

  fs.writeFileSync('public/videos/error-tryhosts.json', JSON.stringify(results, null, 2));
  console.log('diagnostic tryhosts saved to public/videos/error-tryhosts.json');
})();