import { readFile } from 'fs/promises';

const CUMULATIVE_LETTER_DISTRIBUTION = Array(26).fill(4);

// Custom tweaks to letter probabilities. 4 = normal frequency, 1 = rare, 0 = impossible.
const A = 65;
let distributionConfig: [string, number][] = [];

try {
	distributionConfig = JSON.parse(
		await readFile('./assets/distSettings.json', { encoding: 'utf8' }),
	);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (err) {
	// Stuff error.
}
distributionConfig.forEach(([k, v]: [string, number]) => {
	CUMULATIVE_LETTER_DISTRIBUTION[k.charCodeAt(0) - A] = v;
});
const WEIGHT_Σ = CUMULATIVE_LETTER_DISTRIBUTION.reduce((prev, curr) => prev + curr, 0);

// Result is cumulative distribution.
for (let i = 0; i < CUMULATIVE_LETTER_DISTRIBUTION.length; i++) {
	CUMULATIVE_LETTER_DISTRIBUTION[i] = CUMULATIVE_LETTER_DISTRIBUTION[i] / WEIGHT_Σ;
	if (i > 0) {
		CUMULATIVE_LETTER_DISTRIBUTION[i] += CUMULATIVE_LETTER_DISTRIBUTION[i - 1];
	}
}

export function generateRandomNumber(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateWeightedRandomLetter(): string {
	const r = Math.random();
	const bucket = CUMULATIVE_LETTER_DISTRIBUTION.findIndex((v) => r <= v);
	return String.fromCharCode(A + bucket);
}

export function generateRandomAlphanumeric(format: string, values: string[] = []) {
	let hardValue;
	return format.replace(/[LN]/g, (format: string) => {
		switch (format) {
			case 'L':
				// Use letters from array if provided, or random letter if empty.
				hardValue = values.shift();
				return hardValue || generateWeightedRandomLetter();
			case 'N':
				return generateRandomNumber(0, 9).toString();
			default:
				return format;
		}
	});
}

export { CUMULATIVE_LETTER_DISTRIBUTION };
