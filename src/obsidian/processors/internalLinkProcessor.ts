import { ObsidianUtils } from '../obsidianUtils';
import { Options } from '../options';

export class InternalLinkProcessor {
	private utils: ObsidianUtils;

	constructor(utils: ObsidianUtils) {
		this.utils = utils;
	}

	private regex = /(?<=[^!]|^)\[\[(?:(.*?)\|)?([^\]]*)\]\]/gm;

	process(markdown: string, options: Options) {
			return markdown.replaceAll(this.regex, `$2`);
	}
}
