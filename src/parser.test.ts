import { describe, expect, it } from "vitest";
import { parseCodeFileSource } from "./parser";

describe("parseCodeFileSource", () => {
	it("returns null for empty input", () => {
		expect(parseCodeFileSource("")).toBeNull();
		expect(parseCodeFileSource("   ")).toBeNull();
	});

	it("parses a bare path", () => {
		expect(parseCodeFileSource("src/foo.abap")).toEqual({
			linkpath: "src/foo.abap",
			start: undefined,
			end: undefined,
		});
	});

	it("parses a single line range", () => {
		expect(parseCodeFileSource("foo.abap:10")).toEqual({
			linkpath: "foo.abap",
			start: 10,
			end: 10,
		});
	});

	it("parses a start-end range", () => {
		expect(parseCodeFileSource("../lib/x.abap:10-25")).toEqual({
			linkpath: "../lib/x.abap",
			start: 10,
			end: 25,
		});
	});

	it("strips wikilink brackets", () => {
		expect(parseCodeFileSource("[[foo.abap]]")).toEqual({
			linkpath: "foo.abap",
			start: undefined,
			end: undefined,
		});
	});

	it("strips wrapping quotes and keeps spaces in the name", () => {
		expect(parseCodeFileSource('"my file.abap":1-5')).toEqual({
			linkpath: "my file.abap",
			start: 1,
			end: 5,
		});
	});

	it("ignores a trailing colon with no digits", () => {
		expect(parseCodeFileSource("foo.abap:")).toEqual({
			linkpath: "foo.abap:",
			start: undefined,
			end: undefined,
		});
	});
});
