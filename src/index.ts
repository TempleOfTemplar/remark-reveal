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
import {AdvancedSlidesSettings} from './models/AdvancedSlidesSettings';
import {RevealRenderer} from './obsidian/revealRenderer';
import {writeSync, readSync} from 'to-vfile'
import {remark} from 'remark'
import {toMarkdown} from 'mdast-util-to-markdown';

// main()
//
// async function main() {
//     const file = await remark()
//         .use(remarkRevealjs)
//         .process(readSync('demo.md'))
//     if (file) {
//         file.basename = "output.html"
//         writeSync(file)
//     }
//     console.log(String(file))
// }

export default function remarkRevealjs(): any {
    let settings: AdvancedSlidesSettings = DEFAULT_SETTINGS;
    const _revealRenderer = new RevealRenderer(DEFAULT_SETTINGS);
    return (tree, file) => {
        _revealRenderer.render(toMarkdown(tree), false, false)
    };
};