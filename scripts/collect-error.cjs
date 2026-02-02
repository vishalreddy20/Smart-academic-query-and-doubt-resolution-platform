const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const logs = [];
  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    page.on('console', (msg) => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });

    page.on('pageerror', (err) => {
      logs.push(`pageerror: ${err.message}\n${err.stack}`);
    });

    page.on('response', (resp) => {
      logs.push(`response: ${resp.status()} ${resp.url()}`);
    });

    try {
      await page.goto('http://localhost:5173/', { waitUntil: 'load', timeout: 10000 });
    } catch (e) {
      logs.push(`goto-error: ${e.message}`);
    }

    // wait for the ErrorBoundary message or the Sign In text
    await page.waitForTimeout(1000);

    const errEl = await page.$('text=Something went wrong');
    let detailsText = '';
    if (errEl) {
      const details = await page.$('details');
      if (details) {
        detailsText = (await page.evaluate((d) => d.innerText, details)) || '';
      }
    }

    await page.screenshot({ path: 'public/videos/error-screenshot.png', fullPage: true });

    fs.writeFileSync('public/videos/error-logs.txt', logs.join('\n\n') + '\n\nDETAILS:\n' + detailsText);
    console.log('diagnostic saved to public/videos/error-screenshot.png and public/videos/error-logs.txt');
  } catch (err) {
    console.error('diagnostic script error:', err);
    try { if (browser) await browser.close(); } catch (_) {}
    process.exit(1);
  } finally {
    try { if (browser) await browser.close(); } catch (_) {}
  }
})();