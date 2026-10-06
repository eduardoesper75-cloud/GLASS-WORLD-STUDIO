import { test, expect } from '@playwright/test';

test.describe('G2 listado', () => {
  test('renderiza productos del seed', async ({ page }) => {
    await page.goto('/g2', { waitUntil: 'networkidle' });
    await expect(page.getByText('GLASS WORLD STUDIO', { exact: false }).first()).toBeVisible();
    const cards = page.locator('[data-testid="g2-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
  });

  test('filtro de marca acota el listado', async ({ page }) => {
    await page.goto('/g2', { waitUntil: 'networkidle' });
    await page.locator('#g2-brand').fill('Schott');
    await page.locator('#g2-brand').press('Enter');
    await expect(page.getByText('Varilla borosilicato 8mm COE 33')).toBeVisible({ timeout: 15000 });
    const cards = page.locator('[data-testid="g2-card"]');
    expect(await cards.count()).toBe(1);
  });
});