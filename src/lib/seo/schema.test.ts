import { describe, expect, test } from 'bun:test';
import { appSchema, jsonLd, siteSchema } from './schema';

describe('siteSchema', () => {
	test('describes the site, its publisher, and account search', () => {
		const [site, org] = siteSchema('https://unicove.com', 'Vaulta');
		expect(site['@type']).toBe('WebSite');
		expect(site.url).toBe('https://unicove.com');
		expect(site.potentialAction.target.urlTemplate).toBe('https://unicove.com/account/{account}');
		expect(org['@type']).toBe('Organization');
		expect(org.name).toBe('Greymass');
	});
});

describe('appSchema', () => {
	test('names the app after the network', () => {
		const app = appSchema('https://unicove.com/en/vaulta', 'Vaulta');
		expect(app['@type']).toBe('WebApplication');
		expect(app.name).toBe('Unicove');
		expect(app.description).toContain('Vaulta');
		expect(app.offers.price).toBe('0');
	});
});

describe('jsonLd', () => {
	test('wraps the schema in a script tag with the schema.org context', () => {
		const html = jsonLd(appSchema('https://unicove.com/en/vaulta', 'Vaulta'));
		expect(html.startsWith('<script type="application/ld+json">')).toBe(true);
		expect(html).toContain('"@context":"https://schema.org"');
		expect(html.endsWith('</script>')).toBe(true);
	});
	test('never lets the payload close the script tag early', () => {
		const html = jsonLd({ '@type': 'Thing', name: '</script><b>' });
		expect(html.indexOf('</script>')).toBe(html.length - '</script>'.length);
	});
});
