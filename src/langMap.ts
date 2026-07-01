/**
 * Default extension -> Prism/Obsidian language identifier map.
 * Falls back to the raw extension when unmapped, which is correct for many
 * languages whose extension already equals the Prism id (e.g. abap, sql, json).
 */
export const DEFAULT_LANG_MAP: Record<string, string> = {
	abap: "abap",
	js: "javascript",
	mjs: "javascript",
	cjs: "javascript",
	ts: "typescript",
	jsx: "jsx",
	tsx: "tsx",
	py: "python",
	rb: "ruby",
	java: "java",
	c: "c",
	h: "c",
	cpp: "cpp",
	cxx: "cpp",
	cc: "cpp",
	hpp: "cpp",
	cs: "csharp",
	go: "go",
	rs: "rust",
	php: "php",
	swift: "swift",
	kt: "kotlin",
	kts: "kotlin",
	sh: "bash",
	bash: "bash",
	zsh: "bash",
	ps1: "powershell",
	sql: "sql",
	json: "json",
	jsonc: "json",
	yaml: "yaml",
	yml: "yaml",
	xml: "xml",
	html: "html",
	htm: "html",
	css: "css",
	scss: "scss",
	sass: "sass",
	less: "less",
	md: "markdown",
	markdown: "markdown",
	toml: "toml",
	ini: "ini",
	cfg: "ini",
	lua: "lua",
	r: "r",
	scala: "scala",
	dart: "dart",
	pl: "perl",
	pm: "perl",
	vue: "vue",
	svelte: "svelte",
	dockerfile: "docker",
	makefile: "makefile",
};

/** Return the lowercase extension of a path (no leading dot), or "". */
export function getExtension(path: string): string {
	const base = path.split(/[\\/]/).pop() ?? "";
	const idx = base.lastIndexOf(".");
	if (idx <= 0) {
		// No dot, or dotfile with no extension (e.g. ".gitignore") -> treat the
		// whole name as the type key so things like "Dockerfile" still map.
		return base.toLowerCase();
	}
	return base.slice(idx + 1).toLowerCase();
}

/** Map an extension to a language id, honouring user overrides. */
export function extToLang(
	ext: string,
	overrides: Record<string, string> = {},
): string {
	const key = ext.toLowerCase().replace(/^\./, "");
	return overrides[key] ?? DEFAULT_LANG_MAP[key] ?? key;
}
