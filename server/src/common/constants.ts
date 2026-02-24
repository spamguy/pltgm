import type { PlateOrigin } from './types.ts';

export const PLATE_FORMAT_DICT: Record<PlateOrigin, string> = {
	CA: 'NLLLNNN',
	CO: 'LLLNNN',
	OK: 'LLLNNN',
	TX: 'LLLNNNN',
	WA: 'LLLNNNN',
};

export const SOCKETS = {
	APP_ERROR: 'app:error',
	GAME_ERROR: 'game:error',
	GAME_CREATE: 'game:create',
	GAME_CREATED: 'game:created',
	GAME_START: 'game:start',
	GAME_PING: 'game:ping',
	GAME_END: 'game:end',
	GAME_SCORE: 'game:score',
	WORD_CHECK: 'word:check',
	WORD_CHECK_RESULT: 'word:check:result',
};
