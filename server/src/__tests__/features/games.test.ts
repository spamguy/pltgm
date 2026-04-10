import type { Socket } from 'socket.io';
import { setInterval } from 'timers/promises';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { SOCKETS } from '../../common/constants.ts';
import { registerGameHandlers } from '../../features/games.ts';
import { GameService } from '../../shared/services/game.service.ts';
import TimerService from '../../shared/services/timer.service.ts';

const config = vi.hoisted(() => ({
	GAME_ID: 'ABCD1234',
	END_TIME: 1_753_920_000_000,
	logger: {
		info: vi.fn(),
		error: vi.fn(),
		debug: vi.fn(),
	},
}));

vi.mock('@logtape/logtape', () => ({
	getLogger: vi.fn(() => config.logger),
}));

vi.mock('nanoid', () => ({
	nanoid: vi.fn().mockReturnValue(config.GAME_ID),
}));

vi.mock('../../shared/services/game.service.ts', () => ({
	GameService: {
		gameExists: vi.fn().mockResolvedValue(false),
		saveGame: vi.fn().mockResolvedValue(undefined),
		endGame: vi.fn().mockResolvedValue(config.END_TIME),
	},
}));

vi.mock('../../shared/services/timer.service.ts', () => ({
	default: {
		register: vi.fn(),
		unregister: vi.fn(),
	},
}));

vi.mock('timers/promises', () => ({
	setInterval: vi.fn(),
}));

describe('Game features', () => {
	let mockSocket: { on: Mock; emit: Mock };

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(GameService.gameExists).mockResolvedValue(false);
		vi.mocked(GameService.saveGame).mockResolvedValue(undefined);
		vi.mocked(GameService.endGame).mockResolvedValue(config.END_TIME);
		vi.mocked(setInterval).mockReturnValue(
			(async function* () {
				yield* [];
				return undefined;
			})(),
		);
		mockSocket = { on: vi.fn(), emit: vi.fn() };
	});

	afterEach(() => {
		vi.useRealTimers();
		delete process.env.MOCK_STATE;
		delete process.env.MOCK_TEXT;
		delete process.env.GAME_LENGTH;
	});

	function invokeCreateGame(): Promise<void> {
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
			await invokeCreateGame();

			expect(GameService.saveGame).toHaveBeenCalledWith(
				expect.objectContaining({
					id: config.GAME_ID,
					origin: 'CA',
					text: 'ABC1234',
					triplet: 'ABC',
					score: 0,
				}),
			);
		});

		it('strips digits from plate text to derive the triplet', async () => {
			process.env.MOCK_TEXT = 'ZQR4567';
			await invokeCreateGame();

			expect(GameService.saveGame).toHaveBeenCalledWith(
				expect.objectContaining({ text: 'ZQR4567', triplet: 'ZQR' }),
			);
		});

		it('retries ID generation until a unique game ID is found', async () => {
			vi.mocked(GameService.gameExists)
				.mockResolvedValueOnce(true)
				.mockResolvedValueOnce(true)
				.mockResolvedValueOnce(false);

			await invokeCreateGame();

			expect(GameService.gameExists).toHaveBeenCalledTimes(3);
			expect(GameService.saveGame).toHaveBeenCalledTimes(1);
		});

		it('emits GAME_CREATED with the new game', async () => {
			await invokeCreateGame();

			expect(mockSocket.emit).toHaveBeenCalledWith(
				SOCKETS.GAME_CREATED,
				expect.objectContaining({ id: config.GAME_ID, origin: 'CA', text: 'ABC1234' }),
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
			vi.useFakeTimers();
			vi.setSystemTime(1_000_000_000_000);
			vi.mocked(setInterval).mockReturnValue(
				(async function* () {
					yield null;
					return undefined;
				})(),
			);

			await invokeCreateGame();

			// stopTime = 1_000_000_000_000 + 60_000; Date.now() frozen at 1_000_000_000_000
			expect(mockSocket.emit).toHaveBeenCalledWith(SOCKETS.GAME_PING, 60_000);
		});

		it('emits GAME_END with the end timestamp after the round', async () => {
			await invokeCreateGame();

			expect(mockSocket.emit).toHaveBeenCalledWith(SOCKETS.GAME_END, config.END_TIME);
		});

		it('unregisters the game timer after the round ends', async () => {
			await invokeCreateGame();

			expect(TimerService.unregister).toHaveBeenCalledWith(config.GAME_ID);
		});

		it('logs errors without propagating them', async () => {
			const testError = new Error('Redis failure');
			vi.mocked(GameService.saveGame).mockRejectedValueOnce(testError);

			await expect(invokeCreateGame()).resolves.not.toThrow();
			expect(config.logger.error).toHaveBeenCalledWith(testError);
		});
	});
});
