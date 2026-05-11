import { SOCKETS } from '#common/constants';
import type { WordCheckSocketCallback } from '#common/types';
import { socket } from '@/sockets';
import { useGameStore, type GameState } from '@/store/game';
import { useIntervalFn } from '@vueuse/core';
import { createPinia, setActivePinia, type Store } from 'pinia';
import { baseStore, noGameStore } from '../mockData';

const socketHandlers: Record<string, (...args: unknown[]) => void> = {};

vi.mock('@/sockets', () => ({
	socket: {
		on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
			socketHandlers[event] = handler;
		}),
		emit: vi.fn(),
	},
}));

// ---------------------------------------------------------------------------
// useIntervalFn mock — capture the tick callback and expose a pause spy
// ---------------------------------------------------------------------------
let intervalCallback: (() => void) | null = null;
const mockPause = vi.fn();

vi.mock('@vueuse/core', () => ({
	useIntervalFn: vi.fn((callback: () => void) => {
		intervalCallback = callback;
		return { pause: mockPause };
	}),
}));

/** Invoke a socket event handler captured by the mock. Throws if not registered. */
function triggerSocket(event: string, ...args: unknown[]): void {
	const handler = socketHandlers[event];
	if (!handler) throw new Error(`No handler for "${event}" — was setupSockets() called?`);
	handler(...args);
}

function setupStore(game: GameState = noGameStore) {
	const store = useGameStore();
	// Always use fresh arrays/objects so tests can't mutate the shared fixture.
	store.$patch({
		game: game.game ? { ...game.game } : null,
		timer: game.timer,
		guesses: [...game.guesses],
		results: [...game.results],
	});
	store.setupSockets();
	return store;
}

let store: Store<'game', GameState>;

describe('useGameStore', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		intervalCallback = null;

		// Clear call history only — implementations set in vi.mock() factories persist.
		vi.clearAllMocks();

		// Clear captured handlers from previous test
		for (const key of Object.keys(socketHandlers)) {
			delete socketHandlers[key];
		}
	});

	describe('initial state', () => {
		it('has a null game', () => {
			const store = useGameStore();
			expect(store.game).toBeNull();
		});

		it('has an empty guesses array', () => {
			const store = useGameStore();
			expect(store.guesses).toEqual([]);
		});

		it('has timer at 0', () => {
			const store = useGameStore();
			expect(store.timer).toBe(0);
		});

		it('has an empty results array', () => {
			const store = useGameStore();
			expect(store.results).toEqual([]);
		});
	});

	describe('socket setup', () => {
		it('registers a handler for every expected socket event', () => {
			const store = useGameStore();
			store.setupSockets();

			const expectedEvents = [
				SOCKETS.GAME_CREATED,
				SOCKETS.GAME_START,
				SOCKETS.WORD_CHECK_RESULT,
				SOCKETS.GAME_SCORE,
				SOCKETS.GAME_PING,
				SOCKETS.GAME_ENDED,
			];

			for (const event of expectedEvents) {
				expect(socket.on).toHaveBeenCalledWith(event, expect.any(Function));
			}
		});
	});

	describe('GAME_CREATED socket event', () => {
		it('sets the game in state', () => {
			const store = setupStore();

			triggerSocket(SOCKETS.GAME_CREATED, baseStore.game!);

			expect(store.game).toEqual(baseStore.game);
		});
	});

	describe('GAME_START socket event', () => {
		it('sets the timer to 60 000 ms', () => {
			const store = setupStore();

			triggerSocket(SOCKETS.GAME_START);

			expect(store.timer).toBe(60000);
		});

		it('starts a 100 ms interval', () => {
			setupStore();

			triggerSocket(SOCKETS.GAME_START);

			expect(useIntervalFn).toHaveBeenCalledWith(expect.any(Function), 100, {
				immediate: true,
			});
		});

		it('decrements the timer by 100 on each tick', () => {
			const store = setupStore();
			triggerSocket(SOCKETS.GAME_START);

			intervalCallback!();
			expect(store.timer).toBe(59900);

			intervalCallback!();
			expect(store.timer).toBe(59800);
		});

		it('pauses the interval once the timer reaches zero', () => {
			const store = setupStore();
			triggerSocket(SOCKETS.GAME_START);

			store.timer = 100;
			intervalCallback!();

			expect(store.timer).toBe(0);
			expect(mockPause).toHaveBeenCalledTimes(1);
		});

		it('pauses the interval when timer goes below zero', () => {
			const store = setupStore();
			triggerSocket(SOCKETS.GAME_START);

			store.timer = 50; // not a multiple of 100
			intervalCallback!();

			expect(store.timer).toBe(-50);
			expect(mockPause).toHaveBeenCalledTimes(1);
		});

		it('does NOT pause while timer is still above zero', () => {
			const store = setupStore();
			triggerSocket(SOCKETS.GAME_START);

			store.timer = 200;
			intervalCallback!();

			expect(store.timer).toBe(100);
			expect(mockPause).not.toHaveBeenCalled();
		});
	});

	describe('WORD_CHECK_RESULT socket event', () => {
		beforeEach(() => {
			store = setupStore(baseStore);
		});

		it('adds the word to guesses and results when status is "ok"', () => {
			const result: WordCheckSocketCallback = ['tribulation', 'ok'];

			triggerSocket(SOCKETS.WORD_CHECK_RESULT, result);

			expect(store.guesses).toContain('tribulation');
			expect(store.results).toContainEqual(result);
		});

		it('does NOT add to guesses when status is "not_a_matching_word"', () => {
			const result: WordCheckSocketCallback = ['cornfield', 'not_a_matching_word'];

			triggerSocket(SOCKETS.WORD_CHECK_RESULT, result);

			expect(store.guesses).not.toContain('cornfield');
			expect(store.results).toContainEqual(result);
		});

		it('does NOT add to guesses when status is "already_tried"', () => {
			const result: WordCheckSocketCallback = ['facet', 'already_tried'];

			triggerSocket(SOCKETS.WORD_CHECK_RESULT, result);

			expect(store.guesses).not.toContain('facet');
			expect(store.results).toContainEqual(result);
		});

		it('does NOT add to guesses when status is "round_ended"', () => {
			const result: WordCheckSocketCallback = ['intrepid', 'round_ended'];

			triggerSocket(SOCKETS.WORD_CHECK_RESULT, result);

			expect(store.guesses).not.toContain('intrepid');
			expect(store.results).toContainEqual(result);
		});

		it('accumulates guesses and results across multiple events', () => {
			triggerSocket(SOCKETS.WORD_CHECK_RESULT, ['first', 'ok']);
			triggerSocket(SOCKETS.WORD_CHECK_RESULT, ['second', 'already_tried']);
			triggerSocket(SOCKETS.WORD_CHECK_RESULT, ['third', 'ok']);

			expect(store.guesses).toEqual(['first', 'third']);
			expect(store.results).toHaveLength(3);
		});
	});

	describe('GAME_SCORE socket event', () => {
		beforeEach(() => {
			store = setupStore(baseStore);
		});

		it('updates game.score when a game is active', () => {
			triggerSocket(SOCKETS.GAME_SCORE, 666);

			expect(store.game!.score).toBe(666);
		});

		it('does nothing (and does not throw) when no game is active', () => {
			store.$patch(noGameStore);
			expect(store.game).toBeNull();

			expect(() => triggerSocket(SOCKETS.GAME_SCORE, 666)).not.toThrow();
			expect(store.game).toBeNull();
		});
	});

	// -------------------------------------------------------------------------
	describe('GAME_PING socket event', () => {
		beforeEach(() => {
			store = setupStore(baseStore);
		});
		it('sets timer to newTimer + 100 ms latency offset', () => {
			store.timer = 50000;

			triggerSocket(SOCKETS.GAME_PING, 30000);

			// newTimer (30000) + hardcoded latency (100) = 30100
			expect(store.timer).toBe(30100);
		});

		it('throws an error when no game is active', () => {
			store.$patch(noGameStore);
			expect(store.game).toBeNull();

			expect(() => triggerSocket(SOCKETS.GAME_PING, 30000)).toThrow('Game not active');
		});
	});

	// -------------------------------------------------------------------------
	describe('GAME_ENDED socket event', () => {
		beforeEach(() => {
			store = setupStore(baseStore);
		});

		it('sets game.endedAt when a game is active', () => {
			const endTime = new Date('2026-01-01T12:00:00Z');

			triggerSocket(SOCKETS.GAME_ENDED, endTime);

			expect(store.game!.endedAt).toEqual(endTime);
		});

		it('does nothing (and does not throw) when no game is active', () => {
			store.$patch(noGameStore);
			expect(store.game).toBeNull();

			const endTime = new Date('2026-01-01T12:00:00Z');
			expect(() => triggerSocket(SOCKETS.GAME_ENDED, endTime)).not.toThrow();
		});
	});

	describe('startGame()', () => {
		it('emits the GAME_CREATE socket event', async () => {
			const store = setupStore();

			await store.startGame();

			expect(socket.emit).toHaveBeenCalledWith(SOCKETS.GAME_CREATE);
			expect(socket.emit).toHaveBeenCalledTimes(1);
		});
	});
});
