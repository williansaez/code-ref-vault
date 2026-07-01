import { describe, expect, it } from "vitest";
import { extToLang, getExtension } from "./langMap";

describe("getExtension", () => {
	it("extracts a lowercase extension", () => {
		expect(getExtension("src/Foo.ABAP")).toBe("abap");
		expect(getExtension("a/b/c.ts")).toBe("ts");
	});

	it("handles backslash paths", () => {
		expect(getExtension("a\\b\\c.py")).toBe("py");
	});

	it("returns the whole name for extensionless files", () => {
		expect(getExtension("path/to/Dockerfile")).toBe("dockerfile");
	});

	it("treats a dotfile as its own key", () => {
		expect(getExtension(".gitignore")).toBe(".gitignore");
	});
});

describe("extToLang", () => {
	it("maps known extensions", () => {
		expect(extToLang("ts")).toBe("typescript");
		expect(extToLang("py")).toBe("python");
		expect(extToLang("abap")).toBe("abap");
	});

	it("falls back to the raw extension when unmapped", () => {
		expect(extToLang("xyz")).toBe("xyz");
	});

	it("honours overrides", () => {
		expect(extToLang("ts", { ts: "text" })).toBe("text");
	});

	it("is case-insensitive on the key", () => {
		expect(extToLang("PY")).toBe("python");
	});
});
