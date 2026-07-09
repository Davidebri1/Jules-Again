const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
      await page.goto('http://localhost:8081', { timeout: 10000 });
      console.log('UI rendered successfully');
  } catch (e) {
      console.error('Failed to load UI:', e.message);
  } finally {
      await browser.close();
  }
})();
