import { randomUUID } from 'crypto';
import type { Socket } from 'socket.io';
import { setTimeout as sleep } from 'timers/promises';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { SOCKETS, TUTORIAL_PLATE } from '../../common/constants.ts';
import { registerGameHandlers } from '../../features/games.ts';
import { GameService } from '../../shared/services/game.service.ts';
import TimerService from '../../shared/services/timer.service.ts';

const config = vi.hoisted(() => ({
	GAME_ID: 'ABCD1234',
	END_TIME: 1_753_920_000_000,
	HIGH_SCORES: [{ id: 'ABCD1234', isCurrentGame: true, origin: 'CA', text: null, score: 42 }],
	logger: {
		info: vi.fn(),
		error: vi.fn(),
		debug: vi.fn(),
	},
}));

vi.mock('@logtape/logtape', () => ({
	getLogger: vi.fn(() => config.logger),
}));

vi.mock('crypto', () => ({
	randomUUID: vi.fn().mockReturnValue(config.GAME_ID),
}));

vi.mock('../../shared/services/game.service.ts', () => ({
	GameService: {
		gameExists: vi.fn().mockReturnValue(false),
		saveGame: vi.fn().mockReturnValue(undefined),
		endGame: vi.fn().mockReturnValue(config.END_TIME),
		saveHighScoreText: vi.fn().mockReturnValue(true),
		highScoresForTriplet: vi.fn().mockReturnValue(config.HIGH_SCORES),
	},
}));

vi.mock('../../shared/services/timer.service.ts', () => ({
	default: {
		register: vi.fn(),
		unregister: vi.fn(),
	},
}));

vi.mock('timers/promises', () => ({
	setTimeout: vi.fn(),
}));

describe('Game features', () => {
	let mockSocket: { on: Mock; emit: Mock };

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(1_000_000_000_000);
		vi.mocked(sleep).mockImplementation(async () => {
			vi.advanceTimersByTime(61_000);
		});
		mockSocket = { on: vi.fn(), emit: vi.fn() };
	});

	afterEach(() => {
		vi.useRealTimers();
		delete process.env.MOCK_STATE;
		delete process.env.MOCK_TEXT;
		delete process.env.GAME_LENGTH;
	});

	function invokeCreateGame(): void {
		registerGameHandlers(mockSocket as unknown as Socket);
		const [, handler] = (mockSocket.on as Mock).mock.calls.find(
			([event]) => event === SOCKETS.GAME_CREATE,
		)!;
		return handler();
	}

	describe('registerGameHandlers', () => {
		it('returns the socket', () => {
			expect(registerGameHandlers(mockSocket as unknown as Socket)).toBe(mockSocket);
		});

		it('registers a handler for GAME_CREATE', () => {
			registerGameHandlers(mockSocket as unknown as Socket);
			expect(mockSocket.on).toHaveBeenCalledWith(SOCKETS.GAME_CREATE, expect.any(Function));
		});
	});

	describe('createGame', () => {
		beforeEach(() => {
			process.env.MOCK_STATE = 'CA';
			process.env.MOCK_TEXT = 'ABC1234';
		});

		it('saves a game with the expected structure', async () => {
			invokeCreateGame();

			expect(GameService.saveGame).toHaveBeenCalledWith(
				expect.objectContaining({
					id: config.GAME_ID,
					origin: 'CA',
					plateText: 'ABC1234',
					triplet: 'ABC',
				}),
			);
		});

		it('strips digits from plate text to derive the triplet', async () => {
			process.env.MOCK_TEXT = 'ZQR4567';
			await invokeCreateGame();

			expect(GameService.saveGame).toHaveBeenCalledWith(
				expect.objectContaining({ plateText: 'ZQR4567', triplet: 'ZQR' }),
			);
		});

		it('emits GAME_CREATED with the new game', async () => {
			await invokeCreateGame();

			expect(mockSocket.emit).toHaveBeenCalledWith(
				SOCKETS.GAME_CREATED,
				expect.objectContaining({ id: config.GAME_ID, origin: 'CA', plateText: 'ABC1234' }),
			);
		});

		it('emits GAME_START with the default round length in milliseconds', async () => {
			await invokeCreateGame();

			expect(mockSocket.emit).toHaveBeenCalledWith(SOCKETS.GAME_START, 60_000);
		});

		it('emits GAME_START respecting the GAME_LENGTH env var', async () => {
			process.env.GAME_LENGTH = '30';
			await invokeCreateGame();

			expect(mockSocket.emit).toHaveBeenCalledWith(SOCKETS.GAME_START, 30_000);
		});

		it('registers the game timer with the correct stop time', async () => {
			await invokeCreateGame();

			expect(TimerService.register).toHaveBeenCalledWith(config.GAME_ID, expect.any(Date));
		});

		it('emits GAME_PING with remaining milliseconds each time the interval fires', async () => {
			let calls = 0;
			vi.mocked(sleep).mockImplementation(async () => {
				if (++calls > 1) vi.advanceTimersByTime(61_000);
			});

			await invokeCreateGame();

			// stopTime = 1_000_000_000_000 + 60_000; Date.now() frozen at 1_000_000_000_000
			expect(mockSocket.emit).toHaveBeenCalledWith(SOCKETS.GAME_PING, 60_000);
		});

		it('emits GAME_ENDED with the end timestamp and high scores after the round', async () => {
			await invokeCreateGame();

			expect(GameService.highScoresForTriplet).toHaveBeenCalledWith(config.GAME_ID, 'ABC');
			expect(mockSocket.emit).toHaveBeenCalledWith(SOCKETS.GAME_ENDED, {
				endTime: config.END_TIME,
				highScores: config.HIGH_SCORES,
			});
		});

		it('unregisters the game timer after the round ends', async () => {
			await invokeCreateGame();

			expect(TimerService.unregister).toHaveBeenCalledWith(config.GAME_ID);
		});

		it('logs errors without propagating them', async () => {
			const testError = new Error('Redis failure');
			vi.mocked(GameService.saveGame).mockImplementationOnce(() => {
				throw testError;
			});

			await expect(invokeCreateGame()).resolves.not.toThrow();
			expect(config.logger.error).toHaveBeenCalledWith(testError);
		});
	});

	describe('tutorial games', () => {
		function handlerFor(event: string) {
			registerGameHandlers(mockSocket as unknown as Socket);
			return mockSocket.on.mock.calls.find(([e]) => e === event)![1];
		}

		beforeEach(() => {
			process.env.MOCK_STATE = 'WA';
			process.env.MOCK_TEXT = 'ABC1234';
		});

		it('always uses the tutorial plate, ignoring mock env vars', async () => {
			await handlerFor(SOCKETS.GAME_CREATE)({ tutorial: true });

			expect(GameService.saveGame).toHaveBeenCalledWith(
				expect.objectContaining({
					origin: TUTORIAL_PLATE.origin,
					plateText: TUTORIAL_PLATE.text,
					triplet: 'ING',
				}),
			);
			expect(mockSocket.emit).toHaveBeenCalledWith(
				SOCKETS.GAME_CREATED,
				expect.objectContaining({ plateText: TUTORIAL_PLATE.text }),
			);
		});

		it('does not start a timed round', async () => {
			await handlerFor(SOCKETS.GAME_CREATE)({ tutorial: true });

			expect(mockSocket.emit).not.toHaveBeenCalledWith(SOCKETS.GAME_START, expect.anything());
			expect(TimerService.register).not.toHaveBeenCalled();
			expect(sleep).not.toHaveBeenCalled();
			expect(mockSocket.emit).not.toHaveBeenCalledWith(SOCKETS.GAME_ENDED, expect.anything());
		});

		it('ends without marking the game ended or fetching high scores', async () => {
			await handlerFor(SOCKETS.GAME_CREATE)({ tutorial: true });
			handlerFor(SOCKETS.GAME_END)(config.GAME_ID, 'ING');

			expect(GameService.endGame).not.toHaveBeenCalled();
			expect(GameService.highScoresForTriplet).not.toHaveBeenCalled();
			expect(mockSocket.emit).toHaveBeenCalledWith(SOCKETS.GAME_ENDED, {
				endTime: expect.any(Number),
				highScores: [],
			});
		});
	});

	describe('concurrent games', () => {
		function handlerFor(socket: { on: Mock }, event: string) {
			return socket.on.mock.calls.find(([e]) => e === event)![1];
		}

		it("permits ending one game without abort another connection's game", async () => {
			// Sleep until aborted, so both rounds stay open until explicitly ended.
			vi.mocked(sleep).mockImplementation(
				(_ms, _value, options) =>
					new Promise((_resolve, reject) =>
						options?.signal?.addEventListener('abort', () => reject(new Error('aborted'))),
					),
			);
			vi.mocked(randomUUID).mockReturnValueOnce('A-A-A-A-A').mockReturnValueOnce('B-B-B-B-B');

			const socketA = { on: vi.fn(), emit: vi.fn() };
			const socketB = { on: vi.fn(), emit: vi.fn() };
			registerGameHandlers(socketA as unknown as Socket);
			registerGameHandlers(socketB as unknown as Socket);

			const gameA = handlerFor(socketA, SOCKETS.GAME_CREATE)();
			const gameB = handlerFor(socketB, SOCKETS.GAME_CREATE)();

			handlerFor(socketA, SOCKETS.GAME_END)('A-A-A-A-A', 'ABC');
			await gameA;

			expect(config.logger.info).toHaveBeenCalledWith(expect.stringContaining('early'), {
				id: 'A-A-A-A-A',
			});
			expect(config.logger.info).not.toHaveBeenCalledWith(expect.stringContaining('early'), {
				id: 'B-B-B-B-B',
			});
			expect(socketA.emit).toHaveBeenCalledWith(SOCKETS.GAME_ENDED, expect.anything());
			expect(socketB.emit).not.toHaveBeenCalledWith(SOCKETS.GAME_ENDED, expect.anything());

			handlerFor(socketB, SOCKETS.GAME_END)('B-B-B-B-B', 'ABC');
			await gameB;

			expect(socketB.emit).toHaveBeenCalledWith(SOCKETS.GAME_ENDED, expect.anything());
		});
	});

	describe('saveHighScore', () => {
		function invokeSaveHighScore(payload: unknown, ack: Mock): void {
			registerGameHandlers(mockSocket as unknown as Socket);
			const [, handler] = (mockSocket.on as Mock).mock.calls.find(
				([event]) => event === SOCKETS.GAME_HIGH_SCORE,
			)!;
			handler(payload, ack);
		}

		it('saves only the id, trimmed text and origin, ignoring client-sent score', () => {
			const ack = vi.fn();
			invokeSaveHighScore({ id: config.GAME_ID, text: '  ACE  ', origin: 'WA', score: 9999 }, ack);

			expect(GameService.saveHighScoreText).toHaveBeenCalledWith(config.GAME_ID, 'ACE', 'WA');
			expect(ack).toHaveBeenCalledWith(true);
		});

		it('rejects an unknown origin without touching the database', () => {
			const ack = vi.fn();
			invokeSaveHighScore({ id: config.GAME_ID, text: 'ACE', origin: 'ZZ' }, ack);

			expect(GameService.saveHighScoreText).not.toHaveBeenCalled();
			expect(ack).toHaveBeenCalledWith(false);
		});

		it('rejects blank text without touching the database', () => {
			const ack = vi.fn();
			invokeSaveHighScore({ id: config.GAME_ID, text: '   ', origin: 'CA' }, ack);

			expect(GameService.saveHighScoreText).not.toHaveBeenCalled();
			expect(ack).toHaveBeenCalledWith(false);
		});

		it('acks false when the service refuses the update', () => {
			vi.mocked(GameService.saveHighScoreText).mockReturnValueOnce(false);
			const ack = vi.fn();
			invokeSaveHighScore({ id: config.GAME_ID, text: 'ACE', origin: 'CA' }, ack);

			expect(ack).toHaveBeenCalledWith(false);
		});

		it('acks false and logs when the service throws', () => {
			const testError = new Error('DB failure');
			vi.mocked(GameService.saveHighScoreText).mockImplementationOnce(() => {
				throw testError;
			});
			const ack = vi.fn();
			invokeSaveHighScore({ id: config.GAME_ID, text: 'ACE', origin: 'CA' }, ack);

			expect(ack).toHaveBeenCalledWith(false);
			expect(config.logger.error).toHaveBeenCalledWith(testError);
		});
	});
});
