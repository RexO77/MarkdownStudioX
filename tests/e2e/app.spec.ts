import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const seededDocument = {
  id: 'doc_fixture',
  name: 'Fixture',
  content: '# Fixture\n\nInline math: $e^{i\\pi} + 1 = 0$.',
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
};

async function startFresh(page: Page) {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');
}

async function startWithDocument(page: Page) {
  await page.addInitScript((document) => {
    localStorage.clear();
    localStorage.setItem('markdown-studio-onboarded', 'true');
    localStorage.setItem('markdown-studio-documents', JSON.stringify([document]));
    localStorage.setItem('markdown-studio-active-doc', document.id);
  }, seededDocument);
  await page.goto('/');
}

test('fresh launch creates exactly one Welcome document', async ({ page }) => {
  await startFresh(page);

  await expect(page.getByRole('button', { name: 'Start writing' })).toBeVisible();
  await page.getByRole('button', { name: 'Start writing' }).click();
  await page.getByRole('button', { name: /Show index/ }).click();

  await expect(page.getByRole('complementary')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Welcome .*0 words$/ })).toHaveCount(1);
});

test('corrupt storage opens recovery and downloads the untouched bytes', async ({ page }) => {
  const malformed = '{"documents":';
  await page.addInitScript((raw) => {
    localStorage.clear();
    localStorage.setItem('markdown-studio-onboarded', 'true');
    localStorage.setItem('markdown-studio-documents', raw);
  }, malformed);
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Document recovery' })).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem('markdown-studio-documents'))
  ).toBe(malformed);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download raw backup' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^markdown-studio-recovery-\d{4}-\d{2}-\d{2}\.json$/);
});

test('workspace has no serious or critical automated accessibility violations', async ({ page }) => {
  await startWithDocument(page);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const blocking = results.violations.filter(
    (violation) => violation.impact === 'critical' || violation.impact === 'serious'
  );

  expect(blocking).toEqual([]);
});

test('Tab can leave the source editor', async ({ page }) => {
  await startWithDocument(page);
  const editor = page.getByRole('textbox', { name: 'Start writing. The galley typesets as you go.' });

  await editor.click();
  await editor.press('Escape');
  await editor.press('Tab');

  await expect(editor).not.toBeFocused();
});

test('inline math is typeset in the rich galley', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'chromium-mobile', 'Mobile starts in source-only mode.');
  await startWithDocument(page);

  const galley = page.locator('[aria-label="Typeset galley editor"]');
  await expect(galley.locator('.katex')).toBeVisible();
});

test('source paste replaces the selection without rewriting Markdown-like text', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await startWithDocument(page);
  const editor = page.getByRole('textbox', { name: 'Start writing. The galley typesets as you go.' });
  const original = 'Before SELECTED after';
  const pasted = '# Kept as written\n\nconst ready = true;';

  await editor.fill(original);
  await editor.evaluate((element) => {
    const textarea = element as HTMLTextAreaElement;
    textarea.focus();
    textarea.setSelectionRange(7, 15);
  });
  await page.evaluate((text) => navigator.clipboard.writeText(text), pasted);
  await editor.press('ControlOrMeta+V');

  await expect(editor).toHaveValue(`Before ${pasted} after`);
});

test('AI result cannot overwrite another document after a document switch', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'chromium-mobile', 'Desktop multi-panel workflow.');
  const first = { ...seededDocument, id: 'doc_first', name: 'First', content: '# First' };
  const second = { ...seededDocument, id: 'doc_second', name: 'Second', content: '# Second' };
  await page.addInitScript(({ documents, activeId }) => {
    localStorage.clear();
    localStorage.setItem('markdown-studio-onboarded', 'true');
    localStorage.setItem('markdown-studio-documents', JSON.stringify(documents));
    localStorage.setItem('markdown-studio-active-doc', activeId);
    localStorage.setItem('groq-api-key', 'gsk_fixture');
  }, { documents: [first, second], activeId: first.id });

  let markRequestSeen!: () => void;
  const requestSeen = new Promise<void>((resolve) => { markRequestSeen = resolve; });
  let releaseResponse!: () => void;
  const responseGate = new Promise<void>((resolve) => { releaseResponse = resolve; });
  await page.route('https://api.groq.com/openai/v1/chat/completions', async (route) => {
    markRequestSeen();
    await responseGate;
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ choices: [{ message: { content: '# Formatted First' } }] }),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'AI formatting' }).click();
  await page.getByRole('button', { name: 'Format manuscript' }).click();
  await requestSeen;
  await page.getByRole('button', { name: /Show index/ }).click();
  await page.getByRole('button', { name: /^Second / }).click();
  releaseResponse();

  const editor = page.getByRole('textbox', { name: 'Start writing. The galley typesets as you go.' });
  await expect(editor).toHaveValue('# Second');
  await expect(page.getByText('AI result was not applied')).toBeVisible();
});

test('mobile index takes focus when it opens', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-mobile', 'Mobile drawer behavior only.');
  await startWithDocument(page);

  await page.getByRole('button', { name: /Show index/ }).click();
  const index = page.getByRole('complementary');
  await expect(index).toBeVisible();
  await expect(index).toContainText('Index');
  await expect(index.locator(':focus')).toHaveCount(1);
});
