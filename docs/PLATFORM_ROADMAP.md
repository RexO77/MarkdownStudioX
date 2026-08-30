# Markdown Studio X Platform Roadmap

Status: execution plan  
Baseline: `main` at `e035f987809c627279a7e9e748b112a011bd0180`  
Prepared: 2026-08-19

## Decision

The next platform investment should be a **Trustworthy File Workspace**.

This is one coherent product layer, not a collection of unrelated utilities:

- open and import existing Markdown files and folders;
- keep writing in a versioned, transactional local store;
- recover earlier revisions;
- move deletions to Trash;
- export and restore a portable workspace backup;
- synchronize through one conflict-aware coordinator;
- show an honest local, offline, queued, synced, or conflicted state.

The second investment should be a **Proofing Desk**: destination-aware preview,
outline, source-linked diagnostics, and export preflight. This builds directly on
the product promise that “the preview is the product.” It should begin only after
the document-safety gates in this plan pass.

Do not lead the roadmap with more AI controls, accounts, real-time
collaboration, or a plugin system. Those ideas add surface area before the app
can guarantee that writing is durable, recoverable, and represented honestly.

## Why this order

Markdown Studio X already has a distinctive, coherent interface and a broad
editing/export feature set. The limiting factor is trust, not feature count.
Current implementation paths can overwrite or delete writing silently:

1. A malformed document payload is interpreted as an empty library and then
   overwritten. Connected sync can interpret the same empty library as an
   instruction to remove folder files or trash Drive files.
2. Document content and sync metadata commit separately. A crash between those
   writes can make a completed remote operation look like a local deletion on
   the next launch.
3. Deletion has no recovery path, while the confirmation text omits its folder
   and Drive consequences.
4. Concurrent local and remote edits are resolved by timestamps without a
   conflict copy or merge review.
5. The entire document array is synchronously serialized to `localStorage` on
   every edit, so reliability and typing cost worsen with library size.

Established Markdown tools already treat file/folder workflows, Trash, and
recovery as baseline capabilities. A generic preview is also baseline. The
product can differentiate after the foundation by proving how a document will
behave at a chosen destination and explaining mismatches before export.

The primary-source comparison behind that conclusion is in
[`research/markdown-editor-platform-scan.md`](research/markdown-editor-platform-scan.md).

## Product outcomes

The roadmap is complete when a user can truthfully say:

- “I can bring my existing Markdown into the app without copy/paste.”
- “A crash, bad migration, full quota, mistaken delete, stale tab, or sync
  conflict will not silently destroy the only copy.”
- “I can see whether this document is saved locally, waiting to sync, offline,
  or conflicted.”
- “I can recover a previous version or restore a portable backup without
  understanding browser storage.”
- “The preview tells me what will differ on GitHub or in an export and takes me
  to the source that caused the issue.”
- “The editor stays responsive with a large document and a realistic library.”

## Non-goals for these two investments

- Accounts, server-side storage, team permissions, or real-time collaboration.
- A repository hosting client or Git implementation.
- Arbitrary binary asset management.
- Perfect pixel emulation of every Markdown destination.
- AI generation that can replace the current document without a review step.
- A new visual identity. Extend the existing Bell Labs / proof-sheet system.

## Audit summary

### Confirmed strengths to preserve

- The manuscript/galley model is distinctive and understandable once content is
  present.
- Desktop split editing, the editable rich-text galley, and view switching form
  a strong core loop.
- The design language is unusually consistent across chrome, dialogs, status,
  and mobile adaptations.
- Raw HTML is disabled in the rich editor, rendered Markdown passes through a
  central DOMPurify boundary, and the app ships a restrictive CSP.
- Constructs that cannot safely round-trip through the rich editor are detected
  and made read-only instead of being silently rewritten.
- LaTeX Lab and PDF machinery are already kept behind lazy boundaries.
- Mobile now avoids forcing a split view and uses overlay panels instead of
  shrinking the writing surface.

### Release-blocking correctness findings

Treat these as gates before the first new workspace UI ships:

| Priority | Finding | Required outcome |
| --- | --- | --- |
| P0 | Corrupt or inaccessible document storage becomes `[]`, is overwritten, and can cascade into remote deletion. | Invalid storage enters Recovery Mode; no destructive sync can run. |
| P0 | Sync metadata commits before imported or updated documents are durably applied. | One transaction commits local state and sync acknowledgement. |
| P0 | Delete has no Trash/undo and understates external effects. | Delete becomes reversible and copy names every consequence. |
| P0 | AI Undo is not document-scoped. | AI history binds to document ID and starting revision. |
| P0 | Smart Paste always prevents native paste, appends at the end, and can wrap a whole Markdown document as code when it contains `const` or `import`. | Native, cursor-correct paste is the default; transformations require a precise, reviewable action. |
| P0 | Inline math currently displays raw TeX in the rich galley in a tested live-writing case. | The documented math fixture renders and round-trips in every promised surface. |
| P1 | A focused rich editor can ignore an external update and later overwrite it. | External changes become a pending revision or conflict, never a silent overwrite. |
| P1 | Multiple tabs rewrite stale copies of the entire library. | Revision compare-and-swap plus cross-tab coordination prevents stale writes. |
| P1 | Folder and Drive can both write concurrently without a coordinator. | One active write provider by default; all provider work is serialized. |
| P1 | Source-editor Tab and Shift+Tab cannot move focus out, even after Escape. | A documented keyboard escape releases focus. |
| P1 | Mobile drawers lack initial focus, focus containment, inert background, and focus restoration. | Drawers meet modal keyboard behavior while preserving their current appearance. |
| P1 | No automated test suite or CI workflow exists. | Reliability, rendering, export, accessibility, and browser flows run in CI. |

### Design findings

- The first-run screen is polished, but its main action creates an empty
  “Welcome” document and two blank panes. It explains shortcuts before the user
  has experienced the writing loop and foregrounds an AI key before value.
- “Saved” currently means a synchronous browser-storage attempt, while connected
  sync has separate hidden state. The status feels authoritative without saying
  where the durable copy lives.
- Settings presents folder and Drive sync clearly, but it does not explain that
  both may be active, how conflicts resolve, or what deletion does remotely.
- The mobile index can be dismissed from its scrim or Escape, but the visible
  panel has no close control and behaves as a non-modal complementary region.
- The 11px system is visually coherent but requires contrast, zoom, and target
  testing; visual density cannot come at the cost of keyboard reachability.

### Performance baseline

The current production build produced:

- initial JavaScript: 1,775,312 bytes raw / 568,282 bytes gzip;
- main application chunk: 1,152.9 KB raw / 379.9 KB gzip;
- React vendor: 211 KB minified / 69 KB gzip;
- KaTeX: 253 KB minified / 76 KB gzip;
- Radix: 89 KB minified / 31 KB gzip;
- Markdown parser: 33 KB minified / 10 KB gzip;
- initial CSS: 76,360 bytes raw / 17,918 bytes gzip.

The first-run route statically imports the editor route, so onboarding pays for
editor dependencies it does not use. The document store also maps every document
and serializes the full library for every keystroke. These are architectural
costs; micro-optimizing icons or animation will not fix them.

Measured at 4× CPU throttling, a 145.9 KB / 1,000-section document produced a
242 ms post-keystroke galley task in desktop Split view. In a 1.6 Mbps, 150 ms
RTT simulation, mobile and desktop first contentful paint were about 3.78 s and
3.88 s. The shared 474 KB logo is a 1659×1920 JPEG stored with a `.png`
extension and is reused for favicon/touch/OpenGraph roles. Treat these as
baselines to replace, not budgets to preserve.

## Architecture decisions

### 1. One document repository

Introduce a repository interface and make React consume it. UI components may
request operations; they do not read or write browser storage directly.

Suggested records:

```ts
interface DocumentRecord {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  revision: number;
  contentHash: string;
  favorite: boolean;
  deletedAt: number | null;
}

interface RevisionRecord {
  id: string;
  documentId: string;
  parentRevision: number;
  createdAt: number;
  cause: 'edit' | 'import' | 'ai' | 'sync' | 'restore' | 'migration';
  contentHash: string;
  content: string;
}

interface SyncBindingRecord {
  documentId: string;
  provider: 'folder' | 'drive';
  remoteId: string;
  path: string;
  baseHash: string;
  remoteVersion: string;
  acknowledgedRevision: number;
}

interface ConflictRecord {
  id: string;
  documentId: string;
  provider: 'folder' | 'drive';
  baseHash: string;
  localRevision: number;
  remoteContent: string;
  createdAt: number;
  status: 'open' | 'resolved';
}
```

Use IndexedDB for documents, revisions, tombstones, sync bindings, conflicts,
and migration metadata. Keep only small display preferences in `localStorage`.
All multi-record mutations use one IndexedDB transaction.

### 2. Versioned and fail-closed startup

Startup has explicit states: `loading`, `ready`, `recovery`, and `fatal`.

- Copy the exact legacy bytes into a quarantine backup before parsing.
- Validate record shape and schema version.
- Advance migrations transactionally and idempotently.
- Never convert an error into an empty library.
- Never enable destructive sync before a validated repository is `ready`.
- Recovery Mode offers Download raw backup, Retry, and Start new library. Starting
  new does not delete the quarantine backup.

### 3. Revision-aware editing

Every edit session is keyed by `documentId + baseRevision`.

- UI updates optimistically.
- Durable writes are coalesced per document, not per library.
- “Saved locally” appears only after the repository commits that revision.
- Flush on view/document switch and `pagehide`; do not rely only on
  `beforeunload`.
- Before AI, import, sync replacement, delete, restore, and migration, create a
  checkpoint.
- If an async result targets an older revision, open a review/merge flow instead
  of replacing current content.

### 4. One sync coordinator

Folder and Drive become provider adapters. They inspect and return a proposed
plan; they do not independently mutate sync metadata.

The coordinator owns:

- one serialized queue;
- a monotonic dirty generation and guaranteed rerun;
- cancellation on disconnect;
- online/offline state, retry, timeout, and backoff;
- transactional application of local changes and acknowledgements;
- one active write provider by default;
- base-hash conflict detection.

Resolution rules:

| Local vs base | Remote vs base | Result |
| --- | --- | --- |
| unchanged | unchanged | no-op |
| changed | unchanged | push |
| unchanged | changed | pull after checkpoint |
| changed | changed, same hash | acknowledge |
| changed | changed, different hash | clean three-way merge or preserve both and open conflict |
| deleted | changed | conflict; never automatic deletion |

Wall-clock time may help order the UI. It must not decide which content survives.

### 5. Proofing profiles, not renderer forks

Build the Proofing Desk on one parsed document model. A profile contributes
rules, styling, and diagnostics; it does not fork editing or sanitization.

```ts
interface ProofingProfile {
  id: 'galley' | 'github' | 'print';
  label: string;
  render(ast: MarkdownAst, context: ProofingContext): React.ReactNode;
  diagnose(ast: MarkdownAst, context: ProofingContext): Diagnostic[];
  exportRecipes: ExportRecipe[];
}

interface Diagnostic {
  id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  sourceRange: { from: number; to: number };
  profile: ProofingProfile['id'];
  fix?: SafeFix;
}
```

Start with Galley, GitHub, and Print/PDF. Do not promise an exact destination
render where repository context or server-side processing is unavailable. Say
what is simulated and what requires context.

## Delivery graph

```text
F0 regression harness
  ├─ F1 storage safety brake
  ├─ F2 editor correctness fixes
  └─ F3 destructive-action truthfulness
       ↓
W1 repository contract and schema
       ↓
W2 IndexedDB adapter and legacy migration
  ├─ W3 revisions and Trash
  ├─ W4 import and portable backup
  └─ W5 cross-tab coordination
  ├─ S1 route and payload boundaries
  └─ S2 scalable editing and indexing
       ↓
W6 sync coordinator and conflict model
  └─ S3 offline shell and deployment assets
       ↓
W7 workspace/recovery UI and onboarding
       ↓
Gate: trustworthy workspace
       ↓
P1 Markdown AST and proofing contract
  ├─ P2 outline and source-linked diagnostics
  └─ P3 destination profiles
       ↓
P4 export preflight and profile parity
       ↓
Gate: Proofing Desk
```

Performance, accessibility, and browser validation are acceptance criteria in
every package. They are not a cleanup phase at the end.

## Work packages

Keep each pull request below 1,000 changed lines. If a package cannot fit, split
by responsibility without weakening its completion criterion.

### F0 — Regression harness

Objective: make the dangerous paths reproducible before changing them.

Scope:

- Add Vitest, React Testing Library, `fake-indexeddb`, Playwright, and axe.
- Add deterministic fixtures for empty, normal, large, lossy, math, unsafe,
  corrupt, and legacy documents.
- Add fault-injectable storage and provider interfaces.
- Add CI for install, typecheck, lint, unit/integration tests, build, and browser
  smoke tests.

Required tests:

- malformed JSON, valid wrong-shaped JSON, blocked storage, and quota failure;
- fresh first launch under React Strict Mode;
- sync plan with a missing local ID;
- source/galley round-trip fixture set;
- keyboard entry and exit for both editors;
- HTML sanitization and one export smoke test.

Done when CI reports actual passing test counts and can fail deterministically
at each storage/provider fault point.

### F1 — Storage safety brake

Objective: eliminate the current corruption-to-deletion chain before migration.

Scope:

- Return a discriminated load result instead of converting errors to `[]`.
- Validate every stored document field.
- Preserve the raw payload on failure.
- Disable sync deletion unless startup completed from a validated snapshot and
  deletion is represented by an explicit tombstone.
- Replace the ErrorBoundary’s unconsumed session copy with a reachable recovery
  action.

Acceptance:

- Invalid state is unchanged byte-for-byte after reload.
- Invalid state cannot call folder remove or Drive trash.
- Recovery can download the raw bytes.
- Empty first launch still creates exactly one Welcome document.
- A failed persistence attempt never displays `saved`.

### F2 — Editor correctness fixes

Objective: restore trust in paste, math, rich-editor updates, and AI operations.

Scope:

- Make ordinary paste native and selection-aware.
- Put optional paste conversions behind a post-paste suggestion or explicit
  command; never transform a whole multi-construct Markdown payload by a keyword.
- Add fixtures that prove inline/display math render and round-trip.
- Reconcile external changes that arrive while the galley is focused.
- Bind AI history and results to document ID and starting revision.
- Present AI output as a diff with Accept and Reject.

Acceptance:

- Paste replaces the selection or inserts at the caret and preserves untouched
  text before and after it.
- Pasting Markdown containing `const` remains byte-identical unless the user
  explicitly chooses conversion.
- Math fixtures pass in manuscript, rich galley, HTML, PDF path, Word path, and
  LaTeX export as applicable.
- AI Undo cannot mutate a different document.
- AI results cannot overwrite a newer revision without confirmation.

### F3 — Destructive-action truthfulness

Objective: stop irreversible or misleading deletion behavior until Trash lands.

Scope:

- Name folder and Drive effects in delete confirmation.
- Add immediate undo or temporarily retain a deletion tombstone.
- Prevent simultaneous folder/Drive write providers until the coordinator exists.
- Queue one follow-up sync when edits occur during an in-flight pass.
- Abort or invalidate results after disconnect.

Acceptance:

- The dialog text matches every configured target.
- A disconnect cannot later write, toast, or restore a connected state.
- An edit during a slow pass is synced without another keystroke.
- Two providers cannot race silently.

### W1 — Repository contract and schema

Objective: define the stable domain boundary without changing the visible UI.

Scope:

- Add document, revision, tombstone, binding, conflict, and metadata types.
- Add repository methods with transactional result/error types.
- Add content hashing and monotonic revisions.
- Adapt `useDocuments` to the interface while the old adapter still works.

Acceptance:

- Components contain no direct document-storage calls.
- Every mutation declares its expected base revision.
- Unit tests cover optimistic success, stale revision, quota, and transaction
  abort.

### W2 — IndexedDB adapter and migration

Objective: make document persistence transactional and proportional to the
edited document rather than the entire library.

Scope:

- Implement IndexedDB stores and transactions.
- Implement idempotent legacy migration with quarantine.
- Add explicit loading/recovery states.
- Keep the legacy payload until migration verification succeeds.
- Add a measured, durable-save queue and honest status reporting.

Acceptance:

- Crash injection at every migration step resumes without duplicates or loss.
- A second migration run is a no-op.
- A single-character edit does not serialize unrelated documents.
- A quota failure keeps the last valid revision recoverable and offers Export
  All.
- Cross-browser tests pass in Chromium, Firefox, and WebKit for the local store.

### W3 — Revisions and Trash

Objective: make normal mistakes reversible.

Revision policy:

- checkpoint before AI, sync pull/merge, import, delete, restore, and migration;
- coalesce typing after an idle window and a maximum active interval;
- retain a byte-capped rolling history plus user-pinned revisions;
- restoring creates a new revision and never destroys later history.

UI:

- Add History from the document row, command palette, and document header.
- Show time, cause, size delta, and a preview/diff.
- Add Trash to the index with Restore and Permanently delete.
- Give Delete an immediate Undo action.

Acceptance:

- Any retained revision can be restored in two actions or fewer.
- Restore recovers name, content, favorite state, and safe sync binding state.
- Empty Trash is the only irreversible in-app delete action.
- Retention is deterministic and tested at its byte boundary.

### W4 — Open/import and portable backup

Objective: let users enter and leave the platform with their files intact.

Scope:

- Open one or many `.md`, `.markdown`, or `.txt` files.
- Support drag/drop with the same validation path.
- Offer Open folder where the File System Access API exists; use copy-in import
  elsewhere.
- Preserve relative path metadata without exposing arbitrary filesystem paths in
  UI or logs.
- Export a documented backup bundle containing manifest, documents, metadata,
  and optional history.
- Preview a backup before importing and commit it transactionally.

Acceptance:

- UTF-8, BOM, Unicode names, duplicate names, empty files, and size limits are
  covered.
- Unsupported/binary inputs are rejected without partial import.
- Export → clear test store → import produces byte-identical document content and
  equivalent metadata.
- Cancelled import leaves the repository unchanged.

### W5 — Cross-tab coordination

Objective: prevent stale tabs from restoring old library state.

Scope:

- Broadcast committed revisions across tabs.
- Use revision compare-and-swap for every edit.
- Use Web Locks where available with a tested fallback.
- Show a review state when two tabs diverge on the same document.

Acceptance:

- Editing different documents in two tabs preserves both.
- Editing the same base revision in two tabs produces a merge or conflict, never
  last-tab-wins overwrite.
- Closing the leader tab does not stall persistence or sync.

### W6 — Sync coordinator and conflicts

Objective: make sync replayable, cancellable, and unable to lose both versions.

Scope:

- Convert folder and Drive logic into plan-producing provider adapters.
- Commit document changes and acknowledgements transactionally.
- Add dirty generations, rerun, cancellation, timeout, backoff, online flush,
  and provider status.
- Use base hashes/provider versions instead of timestamps for correctness.
- Create conflict revisions and a resolver; deletion versus edit always
  conflicts.
- Retain `drive.file`; use Google Picker for user-selected pre-existing files.

Acceptance:

- Property tests prove every reconciliation preserves at least one exact copy of
  each distinct input until the user resolves it.
- Clock skew does not change the outcome.
- Crashes between remote I/O and local acknowledgement rediscover safely.
- Out-of-order responses converge.
- Offline edits flush exactly once after reconnect.

### W7 — Workspace, recovery, and onboarding UI

Objective: make the safety model visible without turning the editor into an
administration screen.

First-run choices:

1. Open Markdown.
2. Explore a sample.
3. Start blank.

Move AI-key setup to Settings or first use. Keep theme choice only if it does
not delay those three actions.

Workspace changes:

- Index sections: Starred, Recent, Workspace, Trash.
- Statusline states: saving locally, saved locally, offline/queued, syncing,
  synced to target, conflict, save failed.
- Sync settings show one active write target, last success, pending work, and
  consequences of disconnect/delete.
- Recovery Mode uses the existing typographic language and offers concrete
  actions, not an error stack as the primary content.

Acceptance:

- A first-time user reaches meaningful rendered content in one action.
- No screen says only `saved` when remote work is pending or failed.
- Every error state answers: what happened, whether content is safe, and what the
  user can do next.
- The empty state offers Open, Sample, and Start blank.

### P1 — Markdown AST and proofing contract

Objective: create one parsed source of truth for preview, diagnostics, outline,
and export.

Scope:

- Select or define an AST with source positions.
- Keep raw source immutable when switching profiles.
- Move bespoke regex preprocessing into tested transforms where possible.
- Define profile, diagnostic, safe-fix, outline, and export contracts.
- Preserve the existing sanitization choke point.

Acceptance:

- Every diagnostic maps to a stable source range.
- Switching profiles cannot modify Markdown.
- Existing galley fixtures render equivalently or have an approved, documented
  difference.
- Unsafe fixtures remain sanitized in every profile.

### P2 — Outline and source-linked diagnostics

Objective: deliver the useful core of the Proofing Desk before adding visual
profiles.

Diagnostics should include:

- duplicate or missing heading anchors;
- broken internal links;
- unresolved relative links/images when workspace context is available;
- missing image alt text;
- skipped heading levels;
- unsupported/lossy constructs for the rich editor or selected export;
- profile-specific raw HTML, alert, footnote, and task-list differences.

UI:

- A compact Outline/Proof panel, not another permanent wide rail.
- Severity counts in the statusline only when non-zero.
- Selecting an item scrolls and selects the source range.
- Safe fixes show the exact change and remain undoable.

Acceptance:

- Diagnostics update within 200 ms after a settled edit on the large fixture.
- Every item navigates to the correct source.
- No diagnostic silently edits content.
- A document with zero findings adds no persistent visual noise.

### P3 — Destination profiles

Objective: show meaningful destination differences without false fidelity.

Initial profiles:

- Galley: the current typeset product view.
- GitHub: GFM-oriented structure, relative-reference context, alerts, task lists,
  anchors, tables, and known server-rendering caveats.
- Print/PDF: pagination-oriented measure, overflow, widows/orphans where
  supported, image resolution, and page-break diagnostics.

Acceptance:

- Profile choice is persisted per document or workspace.
- Switching is keyboard accessible and under 100 ms after profile code is
  loaded.
- The UI labels simulated behavior and unavailable repository context.
- Source and revision do not change on profile switch.

### P4 — Export preflight and parity

Objective: make export an inspectable result rather than an optimistic download.

Scope:

- Make every export return an awaited success/failure result.
- Run profile diagnostics before export and allow Export anyway for warnings.
- Use `try/finally` for temporary DOM and object URLs.
- Centralize filename rules.
- Generate real DOCX or rename the current Word-compatible HTML honestly.
- Use AST transforms for plain text and LaTeX; preserve fenced-code contents and
  escape all output correctly.
- Embed assets required by a “standalone” HTML promise.

Acceptance:

- Golden fixtures cover headings, tables, alerts, code, math, images, unsafe
  markup, Unicode, links, and punctuation for every export.
- Failed export never produces a success toast.
- DOCX opens without a format warning if it is labeled DOCX.
- Failed PDF cleanup leaves no hidden DOM or leaked object URL.
- Standalone HTML renders its promised typography and math offline.

### S1 — Route and payload boundaries

Objective: make first-run and source-only mobile editing pay only for the code
they use.

Scope:

- Create fit-for-purpose favicon, touch, and OpenGraph assets; correct their
  formats and link the web manifest.
- Lazy-load `Index` after the onboarding decision.
- Lazy-load Galley/Tiptap/ProseMirror/lowlight when Split or Rich Text is
  requested; preload on intent or idle where it improves desktop continuity.
- Dynamically import export renderers after a format is selected.
- Replace `lowlight/common` with explicit or lazy language grammars.
- Load KaTeX JavaScript only when math is present.
- Evaluate `LazyMotion` or CSS for simple overlays only where current motion and
  reduced-motion behavior remain identical.

Acceptance:

- Mobile Markdown view requests no Tiptap, ProseMirror, lowlight, or KaTeX
  JavaScript.
- First-run/onboarding JavaScript is at most 200 KB gzip.
- Source-only mobile initial JavaScript is at most 250 KB gzip and all initial
  resources excluding user content are at most 400 KB.
- 4× CPU / 1.6 Mbps / 150 ms RTT reaches FCP and LCP within 2.5 s.
- Desktop Split retains the accepted layout and shows an explicit, brief galley
  loading state only when the chunk is genuinely not ready.

### S2 — Scalable editing and indexing

Objective: keep source input responsive independently of document and library
size.

Scope:

- Stop full-document syntax correction on every key; operate on the changed
  range or explicit command.
- Move word counts, reading statistics, outline, and library search to
  debounced/idle or worker-backed computation.
- Persist document-list metadata and update only the active document's entry.
- Add a large-document galley policy: coalesce updates during continuous typing,
  show `preview updating` honestly, and prevent monolithic reparses from blocking
  input.
- Investigate off-main-thread Markdown-to-ProseMirror parsing or a lightweight
  read-only Split preview, reserving editable Tiptap for Rich Text.

Acceptance:

- The 145.9 KB / 1,000-section fixture has source input p95 at or below 50 ms
  under 4× CPU and no preview-generated task over 50 ms during continuous typing.
- A 4 MB library's per-edit cost does not scale with total library bytes.
- Index metadata for inactive documents is not recomputed on an active
  keystroke.
- Preview lag is visible and self-clearing; source input remains authoritative.

### S3 — Offline shell and deployment assets

Objective: make the local-first promise survive navigation, reconnect, and a
clean deployment.

Scope:

- Add an update-safe service worker for the app shell and immutable static
  assets only; exclude document data and authenticated responses from Cache
  Storage.
- Flush the durable sync outbox on `online`.
- Show offline, queued, update-ready, and retry states.
- Move LaTeX engine assets to a reproducible, separately deployed,
  content-hashed origin with an asset manifest/version preflight.
- Ask for explicit download/storage consent before the approximately 121.8 MiB
  first-use LaTeX payload.

Acceptance:

- After one successful visit, the core source editor opens and durably edits
  offline.
- Reconnect drains each queued mutation exactly once.
- A clean checkout either proves a working LaTeX asset endpoint in smoke tests or
  disables the Lab with accurate copy; it cannot expose a broken compile path.
- Missing/mismatched engine assets fail before compilation with a recoverable
  explanation.

## Performance plan and budgets

Measure before and after every package with committed fixtures and the same
browser/device profile. Record median and p95; do not report a single best run.

| Measure | Budget |
| --- | --- |
| First-run/onboarding JavaScript | ≤ 200 KB gzip before optional editor preload |
| Source-only mobile editor JavaScript | ≤ 250 KB gzip; no Tiptap/ProseMirror/lowlight/KaTeX JS |
| Total initial source-only resources | ≤ 400 KB excluding user content |
| Typing handler, 50 KB document | p95 ≤ 16 ms |
| Visible preview catch-up after settled input | p95 ≤ 150 ms |
| Durable-save main-thread blocking | p95 ≤ 5 ms |
| Open document in 500-document fixture | p95 ≤ 100 ms |
| Search 500 documents / 10 MB text | p95 ≤ 150 ms, cancellable |
| Long tasks during 10 seconds of continuous typing | none over 50 ms caused by persistence/search |
| Core Web Vitals on mid-tier mobile profile | LCP < 2.5 s, INP < 200 ms, CLS < 0.1 |

Required work:

- Replace the mislabeled 474 KB logo with separate, correctly encoded assets.
- Lazy-load `Index` so onboarding does not import the editor graph.
- Split manuscript shell from rich galley, syntax languages, and export code.
- Load only selected syntax grammars instead of the complete common set.
- Persist one changed document asynchronously instead of serializing all docs.
- Compute document-list metadata on committed records, not every active
  keystroke.
- Move large-library search to an indexed or worker-backed path after the
  repository migration.
- Add performance marks around input, galley reconciliation, durable commit,
  search, sync pass, and export.
- Add a service worker only after repository safety is complete. Cache the app
  shell and static assets; never cache document content or authenticated API
  responses in Cache Storage.

## Accessibility and responsive acceptance

Every work package that touches a user flow must verify:

- keyboard entry and exit, including an Escape-then-Tab editor mechanism;
- visible focus and logical focus return;
- real dialog/drawer semantics for modal mobile panels;
- no focus behind a modal surface;
- accessible names and state for icon buttons, tabs, menus, and status;
- 200% zoom and responsive reflow without hidden actions;
- touch targets that meet WCAG 2.2 minimums and approach 44px on coarse pointers
  without visually bloating desktop chrome;
- reduced-motion behavior;
- light/dark contrast checks for text, focus rings, selected rows, and disabled
  states;
- screen-reader announcements for save, sync, conflict, import, restore, and
  export outcomes without announcing every keystroke.

Run axe as a regression aid, then complete keyboard and screen-reader checks;
an automated axe pass is not a compliance claim.

## Verification matrix

### Data fixtures

- Empty document and empty library.
- 50 KB, 500 KB, and 2 MB documents.
- 10, 100, and 500 document libraries.
- GFM tables, tasks, alerts, nested lists, HTML, footnotes, images, links, and
  fenced code.
- Inline/display math, currency-dollar prose, and math inside code.
- Unicode, RTL text, long unbroken strings, and duplicate filenames.
- Corrupt legacy bytes and every historical valid schema.

### Failure injection

- IndexedDB open, read, write, commit, quota, and transaction-abort failures.
- Crash/close after each migration and sync phase.
- Folder permission prompt/denial/revocation.
- Drive 401, 403, 404, 409-like version mismatch, 429, 5xx, timeout, and
  out-of-order response.
- Offline before edit, during pass, and before acknowledgement.
- Two tabs editing different and identical documents.
- Local edit versus remote edit, rename, and delete from the same base.

### Browsers and viewports

- Current Chromium desktop with folder sync.
- Current Firefox and WebKit desktop with supported local-store/import fallback.
- 390×844 and 375×667 mobile viewports.
- 768px boundary and a landscape phone with safe-area insets.
- 200% browser zoom and reduced-motion preference.

### Required commands

Each PR must run the most focused new test first, then:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
git diff --check
```

If a command is not introduced yet, the PR handoff must say so rather than
claiming it passed.

## Model execution protocol

Give one work package to one model at a time unless the packages are siblings in
the delivery graph and their file allowlists do not overlap.

Every model prompt must include:

1. Baseline branch and SHA.
2. The exact work-package heading from this document.
3. An explicit file allowlist or owned module boundary.
4. Dependencies that must already be merged.
5. Acceptance criteria and required fixtures.
6. Validation commands and browser/viewports.
7. The 1,000 changed-line PR limit.
8. A statement that unrelated cleanup, redesign, copy changes, and dependency
   upgrades are out of scope.

Every model must hand back:

- confirmed root cause or product invariant;
- files changed and why;
- tests added, including actual counts;
- commands run and exact result;
- screenshots for changed visual states;
- remaining risks or unverified browser/provider behavior;
- final diff/stat and `git diff --check` result.

Do not allow two models to edit `useDocuments`, the repository adapter, or the
sync coordinator simultaneously. Parallelize fixture creation, provider contract
tests, export goldens, and profile diagnostics only after their shared contracts
are merged.

## Release gates

### Gate A — safe to build on

- F0–F3 merged.
- Corrupt storage cannot trigger destructive sync.
- Paste, math, AI undo, and rich-editor external-update fixtures pass.
- CI is required on pull requests.

### Gate B — Trustworthy File Workspace

- W1–W7 and S1–S3 merged.
- Migration, recovery, history, Trash, backup/restore, cross-tab, and conflict
  matrices pass.
- No unresolved P0/P1 data-loss issue.
- A browser audit confirms first-run, import, edit, history, restore, delete,
  sync conflict, offline, and recovery flows.
- Performance and accessibility budgets pass or have an explicitly approved
  exception with evidence.

### Gate C — Proofing Desk

- P1–P4 merged.
- Source-linked diagnostics and three initial profiles pass golden and browser
  tests.
- Export preflight is awaited and failure-honest.
- No profile switch or safe fix can modify source without an undoable user
  action.

## Recommended first assignment

Give the first implementation model **F0 — Regression harness** only. Its job is
to make the current failures reproducible, not fix them in the same PR. Then run
F1 and F2 in parallel from the merged harness if their file allowlists are
separate. This keeps the first feature work anchored to observable safety
invariants instead of accumulating more untested behavior.
