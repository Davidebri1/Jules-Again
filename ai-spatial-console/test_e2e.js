const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    console.log("Launching browser...");
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    let hasErrors = false;

    // Listen for unhandled errors
    page.on('pageerror', err => {
      // Ignore woff2 font errors
      if (err.toString().includes('woff2 fonts not supported')) {
          return;
      }
      console.error('PAGE ERROR:', err.message);
      hasErrors = true;
    });

    console.log("Navigating to local dev server...");
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 30000 });

    // Check if the canvas loaded (this indicates 3D layer and expo app compiled)
    const canvasExists = await page.evaluate(() => {
        return !!document.querySelector('canvas');
    });

    if (canvasExists) {
        console.log("3D Canvas loaded successfully.");
    } else {
        console.log("3D Canvas NOT FOUND. The app might not have rendered correctly.");
        hasErrors = true;
    }

    if (hasErrors) {
        console.error("Test Failed: Errors detected on page load.");
        process.exit(1);
    } else {
        console.log("Test Passed: No fatal page errors and canvas rendered.");
        process.exit(0);
    }

  } catch (err) {
    console.error("Test Failed Exception:", err);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
