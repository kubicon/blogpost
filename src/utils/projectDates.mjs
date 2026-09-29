const months = new Map(
	[
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December',
	].map((month, index) => [month, index]),
);

/** @param {string} text */
export function parseReportDate(text) {
	const match = /^([A-Za-z]+) ([1-9]|[12]\d|3[01]), (\d{4})$/.exec(text.trim());
	if (!match) return null;

	const month = months.get(match[1]);
	if (month === undefined) return null;

	const day = Number(match[2]);
	const year = Number(match[3]);
	const date = new Date(Date.UTC(year, month, day));
	// Date.UTC treats years 0–99 specially and normalizes impossible dates.
	date.setUTCFullYear(year);
	if (date.getUTCMonth() !== month || date.getUTCDate() !== day) return null;
	return date;
}

/**
 * @param {{ depth: number, text: string }[]} headings
 * @param {Date} pubDate
 */
export function getProjectUpdate(headings, pubDate) {
	let date = null;
	/** @type {string[]} */
	const invalidHeadings = [];

	for (const heading of headings) {
		if (heading.depth !== 3) continue;
		const parsed = parseReportDate(heading.text);
		if (!parsed) {
			invalidHeadings.push(heading.text);
			continue;
		}
		if (date === null || parsed > date) date = parsed;
	}

	return { date: date ?? pubDate, invalidHeadings };
}
