import { SOCKETS } from '#common/constants';
import type { WordCheckSocketCallback } from '#common/types';
import { socket } from '@/sockets';
import { defineStore } from 'pinia';
import { useTimer, type UseTimer } from 'vue-timer-hook';
import { useGameStore } from './game';

export type RoundState = {
	timer: UseTimer;
	guesses: string[];
	currentScore: number;
};

export const useRoundStore = defineStore('round', {
	state: (): RoundState => ({
		guesses: [],
		currentScore: 0,
		timer: useTimer(30000),
	}),
	actions: {
		setupSockets() {
			const gameStore = useGameStore();

			socket.on(SOCKETS.WORD_CHECK_RESULT, (result: WordCheckSocketCallback) => {
				const [word, status] = result;
				if (status === 'ok') {
					this.guesses.push(word);
				}
			});

			socket.on(SOCKETS.ROUND_SCORE, (newScore: number) => {
				this.currentScore = newScore;
			});

			socket.on(SOCKETS.ROUND_PING, (newTimer: number) => {
				if (!gameStore.currentRound) {
					throw new Error('Round not active');
				}

				const revisedTimer = new Date(gameStore.currentRound.startTime);
				revisedTimer.setSeconds(revisedTimer.getSeconds() + newTimer);

				// if (!this.timer) {
				// 	const timer = useTimer(revisedTimer.getTime());
				// } else {
				this.timer.restart(revisedTimer.getTime());
				// }
			});
		},
	},
});
