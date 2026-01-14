// #region ENUMS

export type SocketStatus = 'ok' | 'error';

// Use unions to include additional origins.
export const PlateOriginsList = ['CA', 'CO', 'TX', 'OK'] as const;
export type PlateOrigin = (typeof PlateOriginsList)[number];

// #endregion

// #region TYPES

export type SocketCallback = {
	status: SocketStatus;
};

export type WordCheckSocketCallback = SocketCallback & {
	isWord: boolean;
};

export type GameRound = {
	gameId: string;
	origin: PlateOrigin;
	text: string;
	roundNumber: number;
};

export type Game = {
	id: string;
	createdAt: string;
};

export type WordCheckParams = {
	gameId: string;
	roundNumber: number;
	word: string;
};

// #endregion
