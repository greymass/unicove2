const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;
const H1 = /^#\s+(.+)\s*$/;

// A nav line is a paragraph of links that all point at sibling proposal files.
const NAV_LINE_LINK = /\[[^\]]*\]\(proposal(?:\.[a-z-]+)?\.md\)/g;

function isLanguageNavLine(line: string): boolean {
	const trimmed = line.trim();
	if (!trimmed) return false;
	const links = trimmed.match(NAV_LINE_LINK);
	if (!links || links.length < 2) return false;
	const withoutLinks = trimmed.replace(NAV_LINE_LINK, '').replace(/\|/g, '').trim();
	return withoutLinks.length === 0;
}

export function prepareVpDocument(raw: string): { title: string | null; body: string } {
	let rest = raw.replace(FRONTMATTER, '');

	const lines = rest.split('\n');
	let title: string | null = null;

	while (lines.length && lines[0].trim() === '') lines.shift();

	if (lines.length) {
		const match = H1.exec(lines[0]);
		if (match) {
			title = match[1].replace(/\s+#+$/, '').trimEnd();
			lines.shift();
		}
	}

	while (lines.length && lines[0].trim() === '') lines.shift();

	if (lines.length && isLanguageNavLine(lines[0])) {
		lines.shift();
	}

	rest = lines.join('\n');
	return { title, body: rest };
}
