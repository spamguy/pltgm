import { format } from 'date-fns';

export function dateToString(date = new Date()) {
	return format(date, 'P');
}
