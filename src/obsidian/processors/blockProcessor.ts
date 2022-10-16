export class BlockProcessor {
	process(markdown: string) {
		return this.transformBlock(markdown);
	}

	transformBlock(markdown: any) {
		console.log("MAAARK DOOOWN:", markdown)
		markdown = markdown.replaceAll(/:::\sblock\s*/g, '<div class="block">\n\n');
		markdown = markdown.replaceAll(':::', '</div>\n\n');
		return markdown;
	}
}
