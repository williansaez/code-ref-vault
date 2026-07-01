import { MarkdownPostProcessorContext, Plugin } from "obsidian";
import {
	CodeFileSettings,
	CodeFileSettingTab,
	DEFAULT_SETTINGS,
} from "./settings";
import { parseCodeFileSource } from "./parser";
import { CodeFileChild } from "./CodeFileChild";

export default class CodeFilePlugin extends Plugin {
	settings: CodeFileSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor(
			"codefile",
			(source, el, ctx) => {
				const spec = this.resolveSpec(source, el, ctx);
				const ref = parseCodeFileSource(spec);
				ctx.addChild(new CodeFileChild(this, ctx, el, ref));
			},
		);

		this.addSettingTab(new CodeFileSettingTab(this.app, this));
	}

	/**
	 * Get the spec string: prefer the block body (first non-empty line), else
	 * read it off the fence info line after the `codefile` keyword.
	 */
	private resolveSpec(
		source: string,
		el: HTMLElement,
		ctx: MarkdownPostProcessorContext,
	): string {
		const body = (source ?? "").trim();
		if (body) {
			const firstLine = body.split("\n").find((l) => l.trim().length > 0);
			if (firstLine) return firstLine.trim();
		}

		const info = ctx.getSectionInfo(el);
		if (info) {
			const fenceLine = info.text.split("\n")[info.lineStart] ?? "";
			return fenceLine.replace(/^[`~]{3,}\s*codefile\b/i, "").trim();
		}

		return "";
	}

	async loadSettings(): Promise<void> {
		const data = (await this.loadData()) as Partial<CodeFileSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data ?? {});
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
