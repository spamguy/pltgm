import type { Except } from 'type-fest';

// #region ENUMS

export type SocketStatus = 'ok' | 'error';

// Use unions to include additional origins.
export const PlateOriginsList = ['CA', 'WA', 'TX'] as const; // 'CO', 'TX', 'OK', 'WA'] as const;
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
	startedAt: Date;
	endedAt?: Date;
	triplet: string;
	plateText: string;
	origin: PlateOrigin;
};

// Represents Game minus anything defaulted by DB.
export type DbGame = Except<Game, 'startedAt' | 'score'>;

export type WordCheckParams = {
	gameId: string;
	word: string;
};

// Reflects Redis naming convention.
export type HighScore = {
	name: string;
	score: number;
};

export type DictionaryEntry = {
	word: string;
	triplet: string;
};

export type ExistsResult = {
	count: number;
};

// #endregion
