import fsExtraModule from 'fs-extra';
import { join, basename, extname } from 'path';
import glob from 'glob';
import Mustache from 'mustache';
import { markdown } from '../markdown';

import defaults from '../defaults.json';
import { ObsidianMarkdownPreprocessor } from './obsidianMarkdownPreprocessor';
import { ObsidianUtils } from './obsidianUtils';
import { YamlParser } from './yamlParser';
import { ImageCollector } from './imageCollector';
import _ from 'lodash';
import path from 'path';
import { fileURLToPath } from 'url';
import { AdvancedSlidesSettings } from '../models/AdvancedSlidesSettings';
const md = markdown();
const { readFile } = fsExtraModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class RevealRenderer {
	private processor: ObsidianMarkdownPreprocessor;
	private pluginDirectory: string;
	private yaml: YamlParser;

	constructor(defaultSettings: AdvancedSlidesSettings) {
		this.pluginDirectory = this.getPluginDirectory();
		const obsidianUtils = new ObsidianUtils(defaultSettings);
		this.processor = new ObsidianMarkdownPreprocessor(obsidianUtils);
		this.yaml = new YamlParser(defaultSettings);
	}

	getPluginDirectory(): string {
		return path.join(__dirname, 'plugins');
	}

	async renderFile(filePath: string, params: any) {
		let renderForExport = false;
		let renderForPrint = false;
		let renderForEmbed = false;

		if (!_.isEmpty(params)) {
			if (_.has(params, 'export')) {
				renderForExport = params?.export;
			}

			if (_.has(params, 'print-pdf')) {
				renderForPrint = true;
			}

			if (_.has(params, 'embed')) {
				renderForEmbed = params?.embed;
			}
		}

		if (renderForExport) {
			ImageCollector.getInstance().reset();
			ImageCollector.getInstance().enable();
		}

		const content = (await readFile(filePath.toString())).toString();
		let rendered = await this.render(content, renderForPrint, renderForEmbed);

		return rendered;
	}

	async render(input: string, renderForPrint: boolean, renderEmbedded: boolean) {
		const { yamlOptions, markdown } = this.yaml.parseYamlFrontMatter(input);
		const options = this.yaml.getSlideOptions(yamlOptions, renderForPrint);
		const revealOptions = this.yaml.getRevealOptions(options);

		const { title } = options;
		const themeUrl = this.getThemeUrl(options.theme);
		const highlightThemeUrl = this.getHighlightThemeUrl(options.highlightTheme);

		const slidifyOptions = this.yaml.getSlidifyOptions(options);
		console.log("markdown before parsing", markdown)
		const processedMarkdown = this.processor.process(markdown, options);
		console.log("markdown after parsing", markdown)
		const slides = this.slidify(markdown, slidifyOptions);
		console.log("markdown after slidify", slides)
		const cssPaths = this.getCssPaths(options.css);

		const settings = this.yaml.getTemplateSettings(options);

		const { enableCustomControls } = options;
		const { enableChalkboard, enableOverview, enableMenu, enableTimeBar, enablePointer } = settings;

		let base = '';
		if (!ImageCollector.getInstance().shouldCollect()) {
			base = '/';
		}

		const context = Object.assign(options, {
			title,
			slides,
			themeUrl,
			highlightThemeUrl,
			cssPaths,
			base,
			enableCustomControls,
			enableChalkboard,
			enableOverview,
			enableMenu,
			enablePointer,
			enableTimeBar,
			revealOptionsStr: JSON.stringify(revealOptions),
		});

		const template = await this.getTemplate(renderEmbedded);
		const result = Mustache.render(template, context);
		return result;
	}

	private isValidUrl(input: string): boolean {
		try {
			new URL(input);
			return true;
		} catch (_) {
			return false;
		}
	}

	private getHighlightThemeUrl(theme: string) {
		if (this.isValidUrl(theme)) {
			return theme;
		}

		const highlightThemes = glob.sync('plugin/highlight/*.css', {
			cwd: this.pluginDirectory,
		});

		const highlightTheme = highlightThemes.find(themePath => basename(themePath).replace(extname(themePath), '') === theme);

		return highlightTheme ? highlightTheme : theme;
	}

	private getThemeUrl(theme: string) {
		if (this.isValidUrl(theme)) {
			return theme;
		}

		const revealThemes = glob.sync('dist/theme/*.css', {
			cwd: this.pluginDirectory,
		});

		const revealTheme = revealThemes.find(themePath => basename(themePath).replace(extname(themePath), '') === theme);

		return revealTheme ? revealTheme : theme;
	}

	private async getTemplate(embed = false) {
		let templateFile;

		if (embed) {
			templateFile = join(this.pluginDirectory, 'template/embed.html');
		} else {
			templateFile = join(this.pluginDirectory, defaults.template);
		}

		const content = (await readFile(templateFile.toString())).toString();
		return content;
	}

	private slidify(markdown: string, slidifyOptions: unknown) {
		return md.slidify(markdown, slidifyOptions);
	}

	private getCssPaths(css: string | string[]) {
		let input: string[] = [];
		if (!css) {
			return input;
		}
		if (typeof css === 'string') {
			input = css.split(',');
		} else {
			input = css;
		}

		return input.map(css => {
			if (this.isValidUrl(css)) {
				return css;
			}
			return css;
		});
	}
}
