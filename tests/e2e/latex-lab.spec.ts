import { expect, test } from '@playwright/test';

const ARTICLE = String.raw`\documentclass{article}
\begin{document}
A fraction: $\frac{1}{2}$.
\end{document}`;

test('LaTeX Lab labels old output, clears it on failure, and recovers', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name === 'chromium-mobile', 'WASM compiler smoke test runs once.');
  test.setTimeout(90_000);
  const asset = await request.head('/core/busytex/busytex.wasm');
  test.skip(!asset.ok() || !asset.headers()['content-type']?.includes('application/wasm'),
    'Run npm run fetch:latex-engine to test the LaTeX Lab.');

  const remote = 'https://texlive2026.texlyre.org/**';
  const lookups: string[] = [];
  await page.context().route(remote, (route) => {
    lookups.push(route.request().url());
    return route.abort();
  });
  await page.goto('/latex');
  const source = page.getByRole('textbox', { name: 'LaTeX source' });
  const compile = page.getByRole('button', { name: 'Compile PDF', exact: true });
  const result = page.locator('p[aria-live="polite"]');
  const download = page.getByRole('link', { name: 'Download PDF', exact: true });

  await source.fill(ARTICLE);
  await compile.click();
  await expect(result).toContainText('Compiled in', { timeout: 60_000 });
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(download).toBeVisible();

  await source.fill(ARTICLE.replace('A fraction:', String.raw`\misspelled`));
  await expect(page.getByRole('link', { name: 'Download previous PDF' })).toBeVisible();
  await compile.click();
  await expect(result).toContainText('Compile failed');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(download).toHaveCount(0);
  await page.getByRole('button', { name: 'Go to line 3' }).click();
  await expect(source).toBeFocused();

  await source.fill(ARTICLE);
  await compile.click();
  await expect(result).toContainText('Compiled in');
  await expect(download).toBeVisible();
  expect(lookups).toEqual([]);
});

test('LaTeX Lab retries a missing TFM metric and keeps the next compile local', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name === 'chromium-mobile', 'WASM compiler smoke test runs once.');
  test.setTimeout(90_000);
  const asset = await request.head('/core/busytex/busytex.wasm');
  test.skip(!asset.ok() || !asset.headers()['content-type']?.includes('application/wasm'),
    'Run npm run fetch:latex-engine to test the LaTeX Lab.');

  const lookups: string[] = [];
  await page.context().route('https://texlive2026.texlyre.org/**', async (route) => {
    lookups.push(new URL(route.request().url()).pathname);
    // Simulate the package service not having the metric, without depending on the network.
    await route.fulfill({ status: 404, headers: { 'access-control-allow-origin': '*' } });
  });

  await page.goto('/latex');
  const source = page.getByRole('textbox', { name: 'LaTeX source' });
  const compile = page.getByRole('button', { name: 'Compile PDF', exact: true });
  const result = page.locator('p[aria-live="polite"]');
  await source.fill(ARTICLE.replace('A fraction:', String.raw`\font\testfont=cmbr10 \testfont A fraction:`));
  await compile.click();
  await expect(result).toContainText('Compile failed', { timeout: 60_000 });
  expect(lookups.some((path) => path.endsWith('/cmbr10'))).toBe(true);

  lookups.length = 0;
  await source.fill(ARTICLE);
  await compile.click();
  await expect(result).toContainText('Compiled in', { timeout: 60_000 });
  await expect(page.locator('canvas')).toHaveCount(1);
  expect(lookups).toEqual([]);
});
