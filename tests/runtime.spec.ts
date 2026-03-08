import { test, expect } from '@playwright/test';
import referencesData from '../src/data/references.json';

test.describe('Reference Detail Pages Runtime Check', () => {
  for (const project of referencesData) {
    test(`Checking project detail: ${project.title}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('pageerror', (exception) => {
        consoleErrors.push(exception.message);
      });
      
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(`/reference/${project.id}`);
      
      // Wait a bit for hydration and potential async errors
      await page.waitForTimeout(2000);

      if (consoleErrors.length > 0) {
        console.error(`Errors found on page /reference/${project.id}:`, consoleErrors);
      }

      expect(consoleErrors).toHaveLength(0);
      
      // Basic visibility check
      await expect(page.locator('h1')).toContainText(project.title);
    });
  }
});
