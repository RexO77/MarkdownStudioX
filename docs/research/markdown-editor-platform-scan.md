# Markdown editor platform scan

Current as of 2026-08-19. This is a narrow comparison of first-party product documentation, focused on file ownership, recovery, workspaces, and target previews.

## Findings

### File-native workspaces are table stakes

- Obsidian defines a vault as a folder on the local file system and makes both creating a folder-backed vault and opening an existing folder part of first launch. ([Obsidian Help](https://obsidian.md/help/vault))
- Typora opens individual Markdown files or whole folders, automatically loads a file's parent folder, and exposes a file tree, outline, quick open, global search, recent folders, file moves, duplicate, rename, delete-to-trash, and undo for file operations. ([Typora Quick Start](https://support.typora.io/Quick-Start/), [Typora File Management](https://support.typora.io/File-Management/))
- StackEdit's own guide treats a file tree, workspace synchronization, cloud “Open from” and “Save on,” and export to disk as ordinary file lifecycle capabilities. ([StackEdit](https://stackedit.io/app))

**Implication:** opening/importing `.md` files and treating a folder as a navigable workspace are baseline expectations, not meaningful differentiation by themselves. Markdown Studio X can still differentiate by making that workspace fully local-first, browser-native, transparent, and unusually safe.

### Recovery and reversible deletion are table stakes for trusted writing

- Obsidian's core File Recovery plugin stores complete snapshots at regular intervals, defaults to at least five minutes between snapshots and seven days of retention, and supports inspecting changes, copying a snapshot, or restoring it. Obsidian still recommends a separate backup. ([Obsidian File recovery](https://obsidian.md/help/plugins/file-recovery))
- Typora moves deleted files to the operating system trash and documents undo for file operations. ([Typora File Management](https://support.typora.io/File-Management/))
- StackEdit moves deleted workspace files to Trash and deletes them only after seven days of inactivity. ([StackEdit](https://stackedit.io/app))

**Implication:** permanent deletion with no undo and no document history is below the trust bar set by established writing tools. Local snapshots, trash/restore, and a portable backup are platform foundations, not optional polish.

### Conflict-safe sync is expected once sync is offered

- StackEdit says its background synchronization downloads, merges, and uploads modifications, and performs a merge when necessary with conflicts resolved. It supports workspace-wide sync plus per-file links to Google Drive, Dropbox, and GitHub. ([StackEdit](https://stackedit.io/app))

**Implication:** “last writer wins” can be a storage policy, but silently overwriting one side is not an adequate user experience. A conflict copy or explicit resolver is the minimum defensible behavior for Markdown Studio X's folder and Drive sync.

### Basic preview is table stakes; destination-aware preflight can differentiate

- GitHub's own writing flow tells users to switch to a Preview tab before saving, and GitHub documents a formal GFM dialect with extensions beyond CommonMark. ([GitHub writing quickstart](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/quickstart-for-writing-on-github), [GFM specification](https://github.github.com/gfm/))
- GitHub's rendering pipeline adds sanitization, syntax highlighting, emoji, task lists, named anchors, image handling, and autolinking after markup conversion. Repository context can also change rendered references such as `#42`. ([github/markup](https://github.com/github/markup), [GitHub Markdown REST API](https://docs.github.com/en/rest/markdown/markdown))
- GitHub automatically builds a heading outline and resolves relative links and images in repository context. ([GitHub README documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes))

**Implication:** another generic live preview is not differentiated. A local proofing layer that understands a chosen destination, flags broken anchors or relative assets, exposes a document outline, and explains constructs that will render differently would be distinctive and directly reinforce Markdown Studio X's “preview is the product” position.

## Product conclusion

Prioritize two connected bets:

1. **Trustworthy file workspace:** open/import files and folders, move the primary document store off synchronous `localStorage`, add snapshots, trash/restore, portable backup, and conflict-safe sync.
2. **Proofing desk:** outline plus destination-aware, source-linked diagnostics that run locally and feed the existing preview/export workflow.

Do not lead the roadmap with broader AI writing, accounts, or collaboration. Those would weaken the local-first promise before the baseline file and recovery model is trustworthy.
