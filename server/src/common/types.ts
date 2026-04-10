// #region ENUMS

export type SocketStatus = 'ok' | 'error';

// Use unions to include additional origins.
export const PlateOriginsList = ['CA', 'CO', 'TX', 'OK', 'WA'] as const;
export type PlateOrigin = (typeof PlateOriginsList)[number];

export type WordCheckResult = 'not_a_matching_word' | 'already_tried' | 'ok' | 'round_ended';

// #endregion

// #region TYPES

export type SocketCallback = {
	status: SocketStatus;
	error?: string;
};

export type WordCheckSocketCallback = [string, WordCheckResult];

export type Game = {
	id: string;
	score: number;
	createTime: number;
	startTime?: number;
	endTime?: number;
	triplet: string;
	text: string;
	origin: PlateOrigin;
};

export type WordCheckParams = {
	gameId: string;
	word: string;
};

// Reflects Redis naming convention.
export type HighScore = {
	value: string;
	score: number;
};

// #endregion
