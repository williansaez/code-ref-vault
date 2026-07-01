# codefile — Obsidian plugin design

Date: 2026-07-01

## Goal

A new Markdown code block that embeds the contents of another file from the
vault, rendered with syntax highlighting derived from the file's extension.
Instead of copy-pasting code into a fenced block, the author points at a file
and the plugin renders its current contents.

## Syntax

The path lives on the fence's info line, after the `codefile` keyword:

````
```codefile path/to/file.abap
```
````

Optional line range (1-based, inclusive):

````
```codefile path/to/file.abap:10-25
```
````

A single line is `:10` (equivalent to `:10-10`). The path may also be given in
the block body (first non-empty line) as a fallback, which is more robust in
contexts where the fence info line is not available to the processor.

Path resolution matches Obsidian links: resolved via
`metadataCache.getFirstLinkpathDest(linkpath, sourcePath)`, so vault-relative
and shortest-unique paths both work.

## Architecture

Small, single-purpose units:

- `src/parser.ts` — pure. `parseCodeFileSource(input) -> CodeFileRef | null`.
  Splits the spec into `{ linkpath, start?, end? }`, strips optional `[[ ]]`
  and quotes. No Obsidian dependency → unit tested.
- `src/langMap.ts` — pure. `getExtension(path)` and
  `extToLang(ext, overrides)`. Default extension→Prism-language map, overridable
  from settings, falls back to the raw extension. Unit tested.
- `src/settings.ts` — `CodeFileSettings`, `DEFAULT_SETTINGS`, and
  `CodeFileSettingTab` (header toggle, max file size, extension overrides).
- `src/CodeFileChild.ts` — `MarkdownRenderChild` owning one embed block:
  resolves the file, reads it, slices the line range, renders, and re-renders on
  `vault.modify`/`vault.rename`. Lifecycle is per-block; cleanup is automatic on
  `onunload`.
- `src/main.ts` — plugin entry. Registers the `codefile` code block processor
  and the settings tab.

## Render flow

1. Processor fires for language `codefile`; receives `source`, `el`, `ctx`.
2. Resolve the spec string: block body first line if present, else the fence
   info line via `ctx.getSectionInfo(el)` with the `codefile` keyword stripped.
3. `parseCodeFileSource` → `CodeFileRef`.
4. Resolve file via `getFirstLinkpathDest`.
5. Enforce max-size setting; read with `vault.cachedRead`.
6. Reject binary content (null byte heuristic).
7. Slice line range if present (clamp/swap invalid ranges, note when out of
   bounds).
8. Map extension → language via `langMap` + settings overrides.
9. Render by delegating to Obsidian itself: build a fenced block
   ` ```lang\n…\n``` ` (fence sized longer than any backtick run in the content)
   and call `MarkdownRenderer.render()` into the element. This inherits the
   theme, Prism highlighting, and native copy button.
10. If the header setting is on, prepend a clickable header showing the path
    (and range); clicking opens the file via `workspace.openLinkText`.

## Live update

Each block is a `MarkdownRenderChild` that `registerEvent`s on
`vault.on('modify')` and `vault.on('rename')`. When the target file changes it
re-renders in place. Isolated lifecycle per block; no global bookkeeping.

## Error handling

Errors render inside the block (never break the note):
- file not found → `⚠ codefile: arquivo não encontrado: X`
- invalid syntax → prompt for a path
- range out of bounds → note + show whole file
- file too large → note the size vs limit
- binary file → note

## Settings

- `showHeader` (bool, default true) — feature A header.
- `maxFileSizeKb` (number, default 512; 0 = unlimited).
- `langOverrides` (map ext→language), edited as `ext=lang` lines.

## Testing

- `parser.ts` and `langMap.ts` are pure functions → unit tests (vitest).
- Render/lifecycle → manual test in a real vault (Obsidian has no easy headless
  runner).

## Non-goals (YAGNI)

- Embedding files outside the vault.
- Remote/URL sources.
- Editing the embedded file from the note.
