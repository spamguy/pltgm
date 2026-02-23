import { format } from 'date-fns';

const CAPITAL_A_CHAR_CODE = 65;

export function generateRandomNumber(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function dateToString(date = new Date()) {
	return format(date, 'P');
}

export function generateRandomAlphanumeric(format: string) {
	return format.replace(/[LN]/g, (format: string) => {
		switch (format) {
			case 'L':
				return String.fromCharCode(CAPITAL_A_CHAR_CODE + generateRandomNumber(0, 25));
			case 'N':
				return generateRandomNumber(0, 9).toString();
			default:
				return format;
		}
	});
}
