// #region ENUMS

// Use unions to include additional origins.
export const PlateOriginsList = ['CA'] as const;
export type PlateOrigins = (typeof PlateOriginsList)[number];

// #endregion

// #region TYPES

export type GameRound = {
	gameId: string;
	origin: PlateOrigins;
	text: string;
	roundNum: number;
};

export interface Game {
	id: string;
	createdAt: string;
}

// #endregion
