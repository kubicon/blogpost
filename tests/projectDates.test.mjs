import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { getProjectUpdate, parseReportDate } from '../src/utils/projectDates.mjs';

const heading = (text) => ({ depth: 3, text });

test('uses the latest valid update when a newer heading has a typo', () => {
	const result = getProjectUpdate(
		[heading('Septmber 29, 2026'), heading('September 28, 2026')],
		new Date('2026-08-20'),
	);
	assert.equal(result.date.toISOString(), '2026-09-28T00:00:00.000Z');
	assert.deepEqual(result.invalidHeadings, ['Septmber 29, 2026']);
});

test('falls back to publication date when no valid update exists', () => {
	const pubDate = new Date('2026-08-20');
	assert.equal(getProjectUpdate([heading('February 30, 2026')], pubDate).date, pubDate);
	assert.equal(getProjectUpdate([], pubDate).date, pubDate);
});

test('accepts leap days and rejects impossible dates', () => {
	assert.equal(parseReportDate('February 29, 2028')?.toISOString(), '2028-02-29T00:00:00.000Z');
	assert.equal(parseReportDate('February 29, 2026'), null);
	assert.equal(parseReportDate('September 31, 2026'), null);
});

test('every project report heading has a valid date', async (t) => {
	const directory = path.join(import.meta.dirname, '../src/content/projects');
	for (const file of await readdir(directory)) {
		if (!/\.(md|mdx)$/.test(file)) continue;
		await t.test(file, async () => {
			const content = await readFile(path.join(directory, file), 'utf8');
			const headings = [...content.matchAll(/^###(?!#)\s+(.+?)\s*#*\s*$/gm)].map((match) => heading(match[1]));
			const { invalidHeadings } = getProjectUpdate(headings, new Date('2000-01-01'));
			assert.deepEqual(
				invalidHeadings,
				[],
				`Invalid update date in ${file}: ${invalidHeadings.map((value) => `### ${value}`).join(', ')}`,
			);
		});
	}
});
