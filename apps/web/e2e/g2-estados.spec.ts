import { test, expect, type Locator } from '@playwright/test';

async function cardNames(loc: Locator): Promise<string[]> {
  return loc.evaluateAll((els) =>
    (els as HTMLElement[]).map((el) => el.textContent ?? '').filter((t) => t.trim().length > 0),
  );
}

test.describe('G2 estados', () => {
  test('filtro sin resultados muestra estado vacío', async ({ page }) => {
    await page.goto('/g2', { waitUntil: 'networkidle' });
    await page.locator('#g2-brand').fill('MarcaInexistenteXYZ');
    await page.locator('#g2-brand').press('Enter');
    const cards = page.locator('[data-testid="g2-card"]');
    await expect(page.locator('nav[aria-label="pagination"]')).toHaveCount(0, { timeout: 15000 });
    const count = await cards.count();
    expect(count).toBeLessThanOrEqual(1);
  });

  test('paginación avanza sin duplicados', async ({ page }) => {
    await page.goto('/g2', { waitUntil: 'networkidle' });
    const cards = page.locator('[data-testid="g2-card"]');
    const first = await cardNames(cards);
    expect(first.length).toBeGreaterThan(0);
    await page.locator('nav[aria-label="pagination"] button:not(:disabled)').last().click();
    await page.waitForTimeout(2000);
    const second = await cardNames(cards);
    const overlap = first.filter((t) => second.includes(t));
    expect(overlap.length).toBe(0);
  });
});