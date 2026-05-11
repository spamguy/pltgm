import { useIntervalFn, type Fn } from '@vueuse/core';

import { type Game, type WordCheckSocketCallback } from '#common/types';
import type { GameState } from './game';

export function onGameCreated(store: GameState, game: Game): void {
	store.game = game;
}

export function onGameStart(store: GameState): void {
	store.timer = 60000;

	const { pause } = useIntervalFn(() => timerIntervalFn(store, pause), 100, { immediate: true });
}

export function onWordCheckResult(store: GameState, result: WordCheckSocketCallback): void {
	const [word, status] = result;
	if (status === 'ok') {
		store.guesses.push(word);
	}

	store.results.push(result);
}

export function onGameScore(store: GameState, newScore: number): void {
	if (store.game) {
		store.game.score = newScore;
	}
}

export function onGamePing(store: GameState, newTimer: number): void {
	const latency = 100;
	if (!store.game) {
		throw new Error('Game not active');
	}

	console.debug(`Time 𝚫 (server - client) = ${(newTimer - store.timer + latency) / 1000}`);
	store.timer = newTimer + latency;
}

export function onGameEnd(store: GameState, endTime: Date): void {
	if (store.game) {
		store.game.endedAt = endTime;
	}
}

/**
 * Logic to execute at intervals during timer run.
 * @param store The game store.
 * @param pause The VueUse pause function.
 */
function timerIntervalFn(store: GameState, pause: Fn) {
	store.timer -= 100;

	if (store.timer <= 0) {
		pause();
	}
}
