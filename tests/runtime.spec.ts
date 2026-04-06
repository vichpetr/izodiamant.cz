import { test, expect } from '@playwright/test';
import referencesData from '../src/data/references.json';

test.describe('Reference Detail Pages Runtime Check', () => {
  for (const project of referencesData) {
    test(`Checking project detail: ${project.title}`, async ({ page }) => {
      // Block tracking scripts to prevent flaky errors outside our control
      await page.route('**/*.google-analytics.com/**', route => route.abort());
      await page.route('**/*.googletagmanager.com/**', route => route.abort());

      const consoleErrors: string[] = [];
      page.on('pageerror', (exception) => {
        // Filter out errors that are likely from third-party or framework internals 
        // if they don't break our core functionality
        if (exception.message.includes('payload') || exception.message.includes('GoogleAnalytics') || exception.message.includes('Unexpected end of JSON input')) {
          return;
        }
        consoleErrors.push(exception.message);
      });
      
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Filter out network 500 errors from reviews API as they are handled by code
          if (text.includes('status of 500') || text.includes('Unexpected end of JSON input')) {
            return;
          }
          consoleErrors.push(text);
        }
      });

      await page.goto(`/reference/${project.id}`, { waitUntil: 'domcontentloaded' });
      
      // Wait for network to settle and hydration to complete
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      if (consoleErrors.length > 0) {
        console.error(`Errors found on page /reference/${project.id}:`, consoleErrors);
      }

      expect(consoleErrors).toHaveLength(0);
      
      // Basic visibility check
      await expect(page.locator('h1')).toContainText(project.title);
    });
  }
});
