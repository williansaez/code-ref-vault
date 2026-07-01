export interface CodeFileRef {
	/** Link path to resolve (Obsidian-style, relative to the current note). */
	linkpath: string;
	/** 1-based inclusive start line, if a range was given. */
	start?: number;
	/** 1-based inclusive end line, if a range was given. */
	end?: number;
}

/**
 * Parse a codefile spec string into a reference.
 *
 * Accepts forms like:
 *   path/to/file.abap
 *   ./file.abap:10
 *   ../lib/x.abap:10-25
 *   [[file.abap]]:1-5
 *   "some file.abap"
 *
 * Returns null when there is no usable path.
 */
export function parseCodeFileSource(input: string): CodeFileRef | null {
	const raw = (input ?? "").trim();
	if (!raw) return null;

	let linkpath = raw;
	let start: number | undefined;
	let end: number | undefined;

	// Trailing :start or :start-end (only digits, so Windows drive letters or
	// paths containing colons elsewhere are left untouched).
	const rangeMatch = raw.match(/^(.*?):(\d+)(?:-(\d+))?\s*$/);
	if (rangeMatch) {
		linkpath = rangeMatch[1].trim();
		start = parseInt(rangeMatch[2], 10);
		end = rangeMatch[3] !== undefined ? parseInt(rangeMatch[3], 10) : start;
	}

	// Strip [[wikilink]] wrapping and surrounding quotes.
	linkpath = linkpath.replace(/^\[\[/, "").replace(/\]\]$/, "").trim();
	linkpath = linkpath.replace(/^["']/, "").replace(/["']$/, "").trim();

	if (!linkpath) return null;

	return { linkpath, start, end };
}
