import type { Socket } from 'socket.io';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { SOCKETS } from '../../common/constants.ts';
import { registerWordHandlers } from '../../features/words.ts';

const config = vi.hoisted(() => ({
	GAME: { id: 'ABCD1234', score: 10, triplet: 'TEN', plateText: 'TEN8646' },
	REMAINING: 42_000,
	logger: {
		warn: vi.fn(),
		debug: vi.fn(),
	},
}));

vi.mock('@logtape/logtape', () => ({
	getLogger: vi.fn(() => config.logger),
}));

vi.mock('../../shared/services/dictionary.service.ts', () => ({
	default: {
		checkWord: vi.fn().mockReturnValue(true),
	},
}));

vi.mock('../../shared/services/game.service.ts', () => ({
	GameService: {
		getGame: vi.fn(() => ({ ...config.GAME })),
		isWordGuessed: vi.fn().mockReturnValue(false),
		addGuess: vi.fn(),
		updateScore: vi.fn(),
	},
}));

vi.mock('../../shared/services/timer.service.ts', () => ({
	default: {
		addTime: vi.fn(() => config.REMAINING),
	},
}));

describe('Word features', () => {
	function mockSocket() {
		return { on: vi.fn(), emit: vi.fn() };
	}

	function checkWordOn(socket: { on: Mock }, word: string) {
		const [, handler] = socket.on.mock.calls.find(([event]) => event === SOCKETS.WORD_CHECK)!;
		return handler({ gameId: config.GAME.id, word });
	}

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('emits score, timer and result to the guessing socket', async () => {
		const socket = mockSocket();
		registerWordHandlers(socket as unknown as Socket);

		await checkWordOn(socket, 'beaten');

		expect(socket.emit).toHaveBeenCalledWith(SOCKETS.GAME_SCORE, config.GAME.score + 6);
		expect(socket.emit).toHaveBeenCalledWith(SOCKETS.GAME_PING, config.REMAINING);
		expect(socket.emit).toHaveBeenCalledWith(SOCKETS.WORD_CHECK_RESULT, ['beaten', 'ok']);
	});

	it('does not emit to a socket that connected later', async () => {
		const socketA = mockSocket();
		const socketB = mockSocket();
		registerWordHandlers(socketA as unknown as Socket);
		registerWordHandlers(socketB as unknown as Socket);

		await checkWordOn(socketA, 'beaten');

		expect(socketA.emit).toHaveBeenCalledWith(SOCKETS.GAME_SCORE, expect.any(Number));
		expect(socketB.emit).not.toHaveBeenCalled();
	});
});
