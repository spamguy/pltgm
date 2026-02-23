import { beforeEach, describe, vi } from 'vitest';

describe('Game features', () => {
	const config = vi.hoisted(() => ({
		BOGUS_ID: 'BLORK7',
	}));

	vi.mock('nanoid', () => {
		return {
			nanoid: vi.fn().mockReturnValue(config.BOGUS_ID),
		};
	});

	vi.mock('../../shared/services/game.service.ts', () => {
		return {
			GameService: {
				gameExists: vi.fn().mockResolvedValue(false),
				saveGame: vi.fn().mockResolvedValue({}),
			},
		};
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});
});
