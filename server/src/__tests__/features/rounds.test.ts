import { SOCKETS } from '#common/constants';
import { generateRandom } from '#common/helpers';
import { PlateOriginsList, type SocketCallback } from '#common/types';
import { registerRoundHandlers } from '#features/rounds';
import { RoundService } from '#services/round.service';
import type { Socket } from 'socket.io';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

// Mock dependencies
vi.mock('#common/helpers', () => ({
	generateRandom: vi.fn().mockReturnValue(1),
}));

vi.mock('#services/round.service', () => ({
	RoundService: {
		saveRound: vi.fn(),
	},
}));

describe('Round features', () => {
	let mockSocket: Socket;
	let socketHandlers: Record<
		string,
		(payload: any, callback: (res: SocketCallback) => void) => void
	>;

	beforeEach(() => {
		vi.clearAllMocks();
		socketHandlers = {};

		mockSocket = {
			on: vi.fn(
				(
					event: string,
					handler: (payload: any, callback: (res: SocketCallback) => void) => void,
				) => {
					socketHandlers[event] = handler;
				},
			),
			emit: vi.fn(),
		} as unknown as Socket;
	});

	describe('registerRoundHandlers', () => {
		it('registers ROUND_CREATE event handler', () => {
			registerRoundHandlers(mockSocket);

			expect(mockSocket.on).toHaveBeenCalledWith(SOCKETS.ROUND_CREATE, expect.any(Function));
		});

		it('returns the socket', () => {
			const result = registerRoundHandlers(mockSocket);
			expect(result).toBe(mockSocket);
		});
	});

	describe('startRound handler', () => {
		it('creates and saves a round with correct data', async () => {
			registerRoundHandlers(mockSocket);

			const payload = {
				gameId: 'test-game-123',
				roundNumber: 1,
			};

			socketHandlers[SOCKETS.ROUND_CREATE](payload, vi.fn());

			expect(RoundService.saveRound).toHaveBeenCalledWith({
				gameId: 'test-game-123',
				origin: PlateOriginsList[0],
				text: '1BBB111', // Replacing CA format with 1s and Bs.
				triplet: 'BBB',
				roundNumber: 1,
				startTime: expect.any(Number),
				score: 0,
			});
			expect(RoundService.saveRound).not.toHaveBeenCalledWith('endTime');
		});

		it('generates random origin from PlateOriginsList', async () => {
			registerRoundHandlers(mockSocket);

			const payload = {
				gameId: 'test-game-123',
				roundNumber: 2,
			};

			(generateRandom as Mock).mockReturnValueOnce(1);

			socketHandlers[SOCKETS.ROUND_CREATE](payload, vi.fn());

			expect(generateRandom).toHaveBeenCalledWith(1, PlateOriginsList.length);

			expect(RoundService.saveRound).toHaveBeenCalledWith(
				expect.objectContaining({
					origin: expect.any(String),
				}),
			);
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			(generateRandom as Mock).mockReturnValue(1);
		});

		it('propagates errors from RoundService.saveRound', async () => {
			registerRoundHandlers(mockSocket);

			const payload = {
				gameId: 'test-game-123',
				roundNumber: 1,
			};

			const error = new Error('Database error');
			(RoundService.saveRound as Mock).mockRejectedValueOnce(error);

			await expect(socketHandlers[SOCKETS.ROUND_CREATE](payload, vi.fn())).rejects.toThrow(
				'Database error',
			);
		});
	});
});
