import { test, expect } from '@playwright/test';

// Standardized performance thresholds (in milliseconds)
const THRESHOLDS = {
  desktop: { fcp: 1000, load: 2000, ttfb: 400 },
  mobile: { fcp: 2000, load: 4000, ttfb: 800 },
};

test.describe('IZODIAMANT Performance Audit', () => {
  test('Desktop Performance Metrics', async ({ page, browserName }) => {
    // Only run on desktop chrome for most accurate local results
    test.skip(browserName !== 'chromium', 'Performance metrics are most stable in Chromium');
    
    const start = Date.now();
    await page.goto('/');
    
    // Extract performance metrics from the browser
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
      
      return {
        ttfb: nav.responseStart - nav.requestStart,
        domContentLoaded: nav.domContentLoadedEventEnd - nav.fetchStart,
        loadTime: nav.loadEventEnd - nav.fetchStart,
        fcp: fcp ? fcp.startTime : 0,
      };
    });

    console.log(`
🚀 Desktop Performance (${browserName}):`);
    console.table(metrics);

    // Basic assertions
    expect(metrics.fcp).toBeLessThan(THRESHOLDS.desktop.fcp);
    expect(metrics.loadTime).toBeLessThan(THRESHOLDS.desktop.load);
  });

  test('Mobile Performance with Throttling (Simulated 4G)', async ({ page, browserName, isMobile }) => {
    test.skip(!isMobile || browserName !== 'chromium', 'Throttling requires Chromium and Mobile device');

    // Set up network and CPU throttling to simulate real-world mobile conditions
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 4 * 1024 * 1024 / 8, // 4 Mbps
      uploadThroughput: 2 * 1024 * 1024 / 8,   // 2 Mbps
      latency: 150, // 150ms RTT
    });
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 }); // 4x slowdown

    await page.goto('/');
    
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const fcp = performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint');
      return {
        ttfb: nav.responseStart - nav.requestStart,
        fcp: fcp ? fcp.startTime : 0,
        loadTime: nav.loadEventEnd - nav.fetchStart,
      };
    });

    console.log('
📱 Mobile Performance (Simulated 4G & 4x CPU Throttling):');
    console.table(metrics);

    expect(metrics.fcp).toBeLessThan(THRESHOLDS.mobile.fcp);
  });

  test('Image Optimization Check', async ({ page }) => {
    await page.goto('/');
    
    // Check for large images (> 500KB)
    const largeImages = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(r => r.initiatorType === 'img' || r.name.match(/\.(jpg|jpeg|png|webp|avif)$/i))
        .filter((r: any) => r.transferSize > 500 * 1024)
        .map(r => ({ name: r.name.split('/').pop(), size: Math.round(r.transferSize / 1024) + ' KB' }));
    });

    if (largeImages.length > 0) {
      console.warn('⚠️ Found large images that might slow down mobile loading:');
      console.table(largeImages);
    }
    
    // We expect 0 images over 500KB thanks to next/image optimization
    expect(largeImages.length).toBe(0);
  });
});
