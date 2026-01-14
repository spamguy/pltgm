import { SOCKETS } from '#common/constants';
import { generateRandom } from '#common/helpers';
import { PlateOriginsList, type SocketCallback } from '#common/types';
import { registerRoundHandlers } from '#features/rounds';
import { RoundService } from '#services/round.service';
import type { Socket } from 'socket.io';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

// Mock dependencies
vi.mock('#common/helpers', () => ({
	generateRandom: vi.fn(),
}));

vi.mock('#services/round.service', () => ({
	RoundService: {
		saveRound: vi.fn(),
	},
}));

describe('Round features', () => {
	describe('registerRoundHandlers', () => {
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
			} as unknown as Socket;
		});

		it('should register ROUND_CREATE event handler', () => {
			registerRoundHandlers(mockSocket);

			expect(mockSocket.on).toHaveBeenCalledWith(SOCKETS.ROUND_CREATE, expect.any(Function));
		});

		it('should return the socket', () => {
			const result = registerRoundHandlers(mockSocket);
			expect(result).toBe(mockSocket);
		});
	});

	describe('startRound handler', () => {
		let mockSocket: Socket;
		let socketHandlers: Record<
			string,
			(payload: any, callback: (res: SocketCallback) => void) => void
		>;
		let mockCallback: Mock;

		beforeEach(() => {
			vi.clearAllMocks();
			socketHandlers = {};
			mockCallback = vi.fn();

			mockSocket = {
				on: vi.fn(
					(
						event: string,
						handler: (payload: any, callback: (res: SocketCallback) => void) => void,
					) => {
						socketHandlers[event] = handler;
					},
				),
			} as unknown as Socket;

			// Mock generateRandom for predictable plate generation
			(generateRandom as Mock).mockReturnValue(0);
		});

		it('should create and save a round with correct data', async () => {
			registerRoundHandlers(mockSocket);

			const payload = {
				gameId: 'test-game-123',
				roundNumber: 1,
			};

			// Mock generateRandom to return first origin
			(generateRandom as Mock).mockReturnValueOnce(1);

			socketHandlers[SOCKETS.ROUND_CREATE](payload, mockCallback);

			expect(RoundService.saveRound).toHaveBeenCalledWith({
				gameId: 'test-game-123',
				origin: PlateOriginsList[0],
				text: expect.any(String),
				roundNumber: 1,
			});
		});

		it('should generate random origin from PlateOriginsList', async () => {
			registerRoundHandlers(mockSocket);

			const payload = {
				gameId: 'test-game-123',
				roundNumber: 2,
			};

			(generateRandom as Mock).mockReturnValueOnce(1);

			socketHandlers[SOCKETS.ROUND_CREATE](payload, mockCallback);

			expect(generateRandom).toHaveBeenCalledWith(1, PlateOriginsList.length);

			expect(RoundService.saveRound).toHaveBeenCalledWith(
				expect.objectContaining({
					origin: expect.any(String),
				}),
			);
		});
	});

	describe('error handling', () => {
		let mockSocket: Socket;
		let socketHandlers: Record<
			string,
			(payload: any, callback: (res: SocketCallback) => void) => void
		>;
		let mockCallback: Mock;

		beforeEach(() => {
			vi.clearAllMocks();
			socketHandlers = {};
			mockCallback = vi.fn();

			mockSocket = {
				on: vi.fn(
					(
						event: string,
						handler: (payload: any, callback: (res: SocketCallback) => void) => void,
					) => {
						socketHandlers[event] = handler;
					},
				),
			} as unknown as Socket;

			(generateRandom as Mock).mockReturnValue(1);
		});

		it('should propagate errors from RoundService.saveRound', async () => {
			registerRoundHandlers(mockSocket);

			const payload = {
				gameId: 'test-game-123',
				roundNumber: 1,
			};

			const error = new Error('Database error');
			(RoundService.saveRound as Mock).mockRejectedValueOnce(error);

			await expect(socketHandlers[SOCKETS.ROUND_CREATE](payload, mockCallback)).rejects.toThrow(
				'Database error',
			);
		});
	});
});
