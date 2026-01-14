import { routes } from '#features/games';
import { testClient } from 'hono/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Game routes', () => {
	const config = vi.hoisted(() => ({
		BOGUS_ID: 'BLORK7',
	}));

	let client: any; // FIXME: Needs correct typing.

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

	vi.mock('../features/rounds.ts', () => ({
		createRound: vi.fn().mockResolvedValue({}),
	}));

	beforeEach(() => {
		vi.clearAllMocks();
		client = testClient(routes);
	});

	describe('Game creation', () => {
		it('returns a new game', async () => {
			const response = await client.index.$post();
			const json = await response.json();

			expect(response.status).toBe(200);
			expect(json).toMatchObject({
				id: config.BOGUS_ID,
				// createdAt: expect(String),
			});
			// origin: 'CA',
			//         text: expect.stringMatching(/[A-Z0-9]{7}/)
		});
	});
});
