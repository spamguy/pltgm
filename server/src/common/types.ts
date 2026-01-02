// #region ENUMS

export type SocketStatus = 'ok' | 'error';

// Use unions to include additional origins.
export const PlateOriginsList = ['CA'] as const;
export type PlateOrigin = (typeof PlateOriginsList)[number];

// #endregion

// #region TYPES

export type SocketCallback = {
	status: SocketStatus;
};

export type GameRound = {
	gameId: string;
	origin: PlateOrigin;
	text: string;
	roundNumber: number;
};

export interface Game {
	id: string;
	createdAt: string;
}

// #endregion
