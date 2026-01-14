import type { PlateOrigin } from './types.ts';

export const PLATE_FORMAT_DICT: Record<PlateOrigin, string> = {
	CA: 'NLLLNNN',
	CO: 'LLLNNN',
	OK: 'LLLNNN',
	TX: 'LLLNNNN',
};

export const SOCKETS = {
	ROUND_CREATE: 'round:create',
	ROUND_START: 'round:start',
	WORD_CHECK: 'word:check',
	WORD_CHECK_RESULT: 'word:check:result',
};
