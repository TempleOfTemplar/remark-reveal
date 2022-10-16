// #!/usr/bin/env node
//
// import argsParser from 'yargs-parser';
// import updater from 'update-notifier';
// import path from 'path';
// import fs from 'fs-extra';
// import open from 'open';
// import pkg from '../package.json';
// import {startServer} from "./server";
// import {writeStatic} from "./static";
// import {exportPDF} from "./print";
//
//
// const alias = {
// 	h: 'help',
// 	s: 'separator',
// 	S: 'vertical-separator',
// 	t: 'theme',
// 	V: 'version'
// };
//
// const argv = argsParser(process.argv.slice(2), {alias});
//
// const {version, static: isStatic, featuredSlide, print, printSize, disableAutoOpen} = argv;
//
// const hasPath = Boolean(argv._[0]);
//
// updater({pkg}).notify();
//
// export const remarkRevealjs = async () => {
// 	/* eslint-disable no-console */
// 	if (version) {
// 		console.log(pkg.version);
// 	} else if (hasPath || isStatic) {
// 		let server: any, initialUrl;
// 		try {
// 			if (isStatic) {
// 				[server] = featuredSlide ? await startServer() : [];
// 				await writeStatic();
// 				server && server.close();
// 			} else if (print) {
// 				[server, initialUrl] = await startServer();
// 				await exportPDF(initialUrl, print, printSize);
// 				server.close();
// 			} else {
// 				[server, initialUrl] = await startServer();
// 				!disableAutoOpen && open(initialUrl as any, {url: true} as any);
// 				process.on('SIGINT', () => {
// 					console.log('Received SIGINT, closing gracefully.');
// 					server.close();
// 					process.exit(128);
// 				});
// 			}
// 		} catch (err) {
// 			console.error(err);
// 			process.exit(1);
// 		}
// 	} else {
// 		const help = await fs.readFile(path.join(__dirname, './help.txt'));
// 		console.log(help.toString());
// 	}
// }
// remarkRevealjs();
const DEFAULT_SETTINGS: AdvancedSlidesSettings = {
	port: '3000',
	autoReload: true,
	exportDirectory: '/export',
	enableChalkboard: false,
	enableOverview: false,
	enableMenu: false,
	enablePointer: false,
	enableTimeBar: false,
	theme: 'black',
	highlightTheme: 'zenburn',
	transition: 'slide',
	transitionSpeed: 'default',
	controls: true,
	progress: true,
	slideNumber: false,
	showGrid: false,
	autoComplete: 'inPreview',
	paneMode: 'split'
};
import { AdvancedSlidesSettings } from '../obsidian-advanced-slides/src/main';
import { ObsidianUtils } from '../obsidian-advanced-slides/src/obsidianUtils';
import {RevealRenderer} from '../obsidian-advanced-slides/src/revealRenderer'
export const remarkRevealjs = async () => {
	let settings: AdvancedSlidesSettings = DEFAULT_SETTINGS;
	this.obsidianUtils = new ObsidianUtils(this.app, settings);
	const _revealRenderer = new RevealRenderer(utils);
};

remarkRevealjs();
