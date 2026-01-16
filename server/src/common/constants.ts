import type { PlateOrigin } from './types.ts';

export const PLATE_FORMAT_DICT: Record<PlateOrigin, string> = {
	CA: 'NLLLNNN',
	CO: 'LLLNNN',
	OK: 'LLLNNN',
	TX: 'LLLNNNN',
	WA: 'LLLNNNN',
};

export const SOCKETS = {
	ROUND_CREATE: 'round:create',
	ROUND_START: 'round:start',
	ROUND_PING: 'round:ping',
	WORD_CHECK: 'word:check',
	WORD_CHECK_RESULT: 'word:check:result',
};
