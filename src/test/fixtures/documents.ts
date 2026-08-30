import type { Document } from '@/hooks/useDocuments';

export const documentFixture = (overrides: Partial<Document> = {}): Document => ({
  id: 'doc_fixture',
  name: 'Fixture',
  content: '# Fixture\n\nLocal-first writing.',
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
  ...overrides,
});

export const markdownFeatureFixture = `# Proof sheet

> [!NOTE]
> Local-first, export-ready writing.

- [x] Write
- [ ] Proof

Inline math: $e^{i\\pi} + 1 = 0$.

\`\`\`ts
const ready = true;
\`\`\`
`;

export const unsafeMarkdownFixture = `# Unsafe

<script>window.__unsafe = true</script>

<img src="x" onerror="window.__unsafe = true">

[bad](javascript:alert(1))
`;
