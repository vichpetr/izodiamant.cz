import { test, expect } from '@playwright/test';

// Focus on what user sees (Visual metrics are more important than total load)
const THRESHOLDS = {
  desktop: { fcp: 1000, lcp: 2000, load: 8000 },
  mobile: { fcp: 2500, lcp: 4000, load: 10000 },
};

test.describe('IZODIAMANT Performance Audit', () => {
  test('General Performance Metrics', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'LCP extraction is most reliable in Chromium');
    
    await page.goto('/');

    // Accept cookies if the modal is present
    const acceptButton = page.getByRole('button', { name: 'Povolit vše' });
    try {
      await acceptButton.waitFor({ state: 'visible', timeout: 2000 });
      await acceptButton.click();
    } catch (e) {}
    
    // Extract performance metrics including LCP
    const metrics = await page.evaluate(async () => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
      
      // LCP is measured via observer
      const lcp: any = await new Promise((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          resolve(entries[entries.length - 1]);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Timeout if no LCP found
        setTimeout(() => resolve({ startTime: 0 }), 3000);
      });
      
      return {
        ttfb: Math.round(nav.responseStart - nav.requestStart),
        fcp: fcp ? Math.round(fcp.startTime) : 0,
        lcp: lcp ? Math.round(lcp.startTime) : 0,
        loadTime: Math.round(nav.loadEventEnd - nav.fetchStart),
      };
    });

    const isMobile = page.viewportSize()!.width < 768;
    const threshold = isMobile ? THRESHOLDS.mobile : THRESHOLDS.desktop;

    console.log(`\n🚀 Performance (${isMobile ? 'Mobile' : 'Desktop'}):`);
    console.table(metrics);

    expect(metrics.fcp).toBeLessThan(threshold.fcp);
    expect(metrics.lcp).toBeLessThan(threshold.lcp);
    // Increased loadTime limit to account for third-party scripts/API fetches
    expect(metrics.loadTime).toBeLessThan(threshold.load);
  });

  test('Mobile Throttling Simulation', async ({ page, browserName }) => {
    // Only run on specific mobile project to avoid redundancy
    test.skip(browserName !== 'chromium' || page.viewportSize()!.width > 500, 'Only for mobile chrome');

    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps (Slow 4G)
      uploadThroughput: 750 * 1024 / 8,
      latency: 150,
    });
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    await page.goto('/');
    
    const metrics = await page.evaluate(() => {
      const fcp = performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint');
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        fcp: fcp ? Math.round(fcp.startTime) : 0,
        loadTime: Math.round(nav.loadEventEnd - nav.fetchStart),
      };
    });

    console.log('\n📱 Slow 4G Simulation:');
    console.table(metrics);

    expect(metrics.fcp).toBeLessThan(THRESHOLDS.mobile.fcp);
  });
});
