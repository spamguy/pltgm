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
};

export type WordCheckSocketCallback = [string, WordCheckResult];

export type GameRound = {
	gameId: string;
	origin: PlateOrigin;
	text: string;
	triplet: string;
	roundNumber: number;
	score: number;
	startTime: number;
	endTime?: number;
};

export type Game = {
	id: string;
	createdAt: string;
};

export type RoundParams = Pick<GameRound, 'gameId' | 'roundNumber'>;

export type WordCheckParams = {
	gameId: string;
	roundNumber: number;
	word: string;
};

// #endregion
