import { readFileSync } from 'fs-extra';
import path from 'path';
import { ImageCollector } from './imageCollector';
import { AdvancedSlidesSettings } from '../models/AdvancedSlidesSettings';
// const fs = require("fs");
import fs, { Dirent } from "fs";

export class ObsidianUtils {
	private settings: AdvancedSlidesSettings;
	private yamlRegex = /^---.*?---\n(.*?)($|---)/s;

	constructor(settings: AdvancedSlidesSettings) {
		this.settings = settings;
	}


	getVaultDirectory(): string {
		return __dirname;
	}

	getPluginDirectory(): string {
		return path.join(this.getVaultDirectory(), '.obsidian', 'plugins/obsidian-advanced-slides/');
	}

	getDistDirectory(): string {
		return path.join(this.getPluginDirectory(), '/dist/');
	}

	getExportDirectory(): string {
		return path.join(this.getVaultDirectory(), this.settings.exportDirectory);
	}

	getSettings(): AdvancedSlidesSettings {
		return this.settings;
	}
	
	private getFiles (dir, files_){
		files_ = files_ || [];
		var files = fs.readdirSync(dir);
		for (var i in files){
			var name = dir + '/' + files[i];
			if (fs.statSync(name).isDirectory()){
				this.getFiles(name, files_);
			} else {
				files_.push(name);
			}
		}
		return files_;
	}

	
	findFile(path: string) {
		let base = '';
		if (!ImageCollector.getInstance().shouldCollect()) {
			base = '/';
		}
		const file = fs.readFileSync(path, 'utf8');
		if (file) {
			return base + file;
		} else {
			return path;
		}
	}

	substring(input: string, startLine: number, startColumn: number, endLine: number, endColumn: number): string {
		let result = "";
		const lines = input.split('\n');

		let eline = lines.length;
		if (endLine > -1) {
			eline = endLine;
		}

		for (let index = startLine; index <= eline; index++) {
			const line = lines[index];
			if (line) {
				if (index == startLine) {
					result += line.substring(startColumn) + '\n';
				} else if (index == eline) {
					let endLine = line;
					if (endColumn > -1) {
						endLine = line.substring(0, endColumn);
					}
					if (endLine.includes('^')) {
						endLine = endLine.substring(0, endLine.lastIndexOf('^'));
					}
					result += endLine + '\n';
				} else {
					result += line + '\n';
				}
			}
		}

		return result;
	}

	similarity(s1: string, s2: string): number {
		let longer = s1;
		let shorter = s2;
		if (s1.length < s2.length) {
			longer = s2;
			shorter = s1;
		}
		const longerLength = longer.length;
		if (longerLength == 0) {
			return 1.0;
		}
		return (longerLength - this.editDistance(longer, shorter)) / longerLength;
	}

	editDistance(s1: string, s2: string): number {
		s1 = s1.toLowerCase();
		s2 = s2.toLowerCase();

		const costs = [];
		for (let i = 0; i <= s1.length; i++) {
			let lastValue = i;
			for (let j = 0; j <= s2.length; j++) {
				if (i == 0)
					costs[j] = j;
				else {
					if (j > 0) {
						let newValue = costs[j - 1];
						if (s1.charAt(i - 1) != s2.charAt(j - 1))
							newValue = Math.min(Math.min(newValue, lastValue),
								costs[j]) + 1;
						costs[j - 1] = lastValue;
						lastValue = newValue;
					}
				}
			}
			if (i > 0)
				costs[s2.length] = lastValue;
		}
		return costs[s2.length];
	}

}
