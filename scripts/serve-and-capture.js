import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 5173;
const serveDir = path.resolve(__dirname, '../dist');

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const filePath = path.join(serveDir, p);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    if (ext === '.js') res.setHeader('Content-Type', 'application/javascript');
    if (ext === '.css') res.setHeader('Content-Type', 'text/css');
    if (ext === '.html') res.setHeader('Content-Type', 'text/html');
    res.end(data);
  });
});

(async () => {
  server.listen(port, '127.0.0.1');
  console.log('Static server listening on http://127.0.0.1:' + port);

  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`[console:${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log('[pageerror]', err && err.stack ? err.stack : err && err.message ? err.message : err);
  });

  try {
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/page.png', fullPage: true });
    console.log('Screenshot saved to screenshots/page.png');
  } catch (e) {
    console.log('Navigation error:', e.message);
  }

  await browser.close();
  server.close();
})();