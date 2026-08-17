# Security Policy

## Reporting a vulnerability

Please report security issues **privately** — do not open a public issue.

- Preferred: open a [private security advisory](https://github.com/RexO77/MarkdownStudioX/security/advisories/new)
  on this repository.
- Alternatively, email **nischal.skanda07@gmail.com** with `SECURITY` in the subject.

Please include what you can: affected version or commit, reproduction steps or a
proof-of-concept document, and the impact you believe it has. This is a
volunteer-maintained project — expect an initial response within about a week.
Please give a reasonable window for a fix before disclosing publicly.

## Supported versions

Only the latest deployed version at <https://mdx.nischal.fyi> and the current
`main` branch are supported. There are no maintained release branches.

## Security model

Markdown Studio X is a **fully client-side** application. There is no backend
and no server that holds user data.

- **Documents** live in the browser's `localStorage`, and — if the user connects
  one — as plain `.md` files in a folder they chose or in their own Google Drive.
- **Google Drive sync** uses the OAuth `drive.file` scope, so the app can only
  access files it created. The access token is held in `sessionStorage` for the
  life of the tab and revoked on disconnect. There is no client secret: the
  OAuth *client ID* is a public value that ships in the bundle by design.
- **AI formatting** is opt-in. The user's own Groq API key is stored locally and
  sent only to `api.groq.com`, with the text the user explicitly submits.
- **LaTeX Lab** compiles documents locally in WebAssembly. Document content is
  never uploaded; only TeX *package* files are fetched from
  `texlive2026.texlyre.org`.

### Trust boundaries

Document content is treated as **untrusted**. Documents can be pasted, generated
by an AI, or imported from a synced folder or Drive that another party can write
to. Consequently:

- All rendered HTML passes through DOMPurify at a single choke point
  (`convertMarkdownToHtml` in `src/utils/markdownUtils.ts`) before it reaches any
  export or DOM sink.
- The rich-text galley renders through Tiptap nodes with raw HTML disabled, and
  refuses to edit documents it cannot round-trip safely.
- KaTeX runs with `trust: false`; the LaTeX engine runs with shell-escape
  disabled.
- Response headers, including a Content-Security-Policy, are defined in
  [`vercel.json`](vercel.json).

### Known accepted risks

- Anyone with access to the user's browser profile can read their documents and
  stored keys. This is inherent to a local-first app with no account.
- Exported `.html` files carry sanitized document content, but the user is
  responsible for where they publish them.

## Scope

In scope: XSS or code execution in the app, leakage of tokens/keys/documents to
third parties, sync logic that destroys or discloses user data, and
authorization flaws in the Drive integration.

Out of scope: issues requiring physical or malware-level access to a user's
device, vulnerabilities in third-party services (Google, Groq, Vercel), missing
hardening with no demonstrated impact, and denial of service through
deliberately large documents.
