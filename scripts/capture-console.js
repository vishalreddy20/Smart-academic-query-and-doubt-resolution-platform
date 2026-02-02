(async () => {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`[console:${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log('[pageerror]', err && err.message ? err.message : err);
  });

  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  // Wait a moment for any deferred runtime errors
  await page.waitForTimeout(1000);
  await browser.close();
})();