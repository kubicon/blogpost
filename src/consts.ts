// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Astro Blog';
export const SITE_DESCRIPTION = 'Welcome to my website!';

export interface Project {
	title: string;
	href: string;
}

export const PROJECTS: Project[] = [
	{ title: 'Project One', href: '#' },
	{ title: 'Project Two', href: '#' },
];
