<script setup lang="ts">
import { SOCKETS } from '#common/constants';
import type { WordCheckResult } from '#common/types';
import { socket } from '@/sockets';
import { useGameStore } from '@/store/game';
import { ref } from 'vue';

const store = useGameStore();
const wordGuess = ref('');
const guessResult = ref('');

socket.on(SOCKETS.WORD_CHECK_RESULT, (result: WordCheckResult) => {
	if (result === 'ok' && store.currentRound) {
		store.guesses.push(wordGuess.value);
	}

	// Trigger result message in UI.
	guessResult.value = result;
	setTimeout(() => {
		guessResult.value = '';
	}, 1000);
});

socket.on(SOCKETS.ROUND_SCORE, (newScore: number) => {
	if (store.currentRound) {
		store.currentRound.score = newScore;
	}
});

function checkWord() {
	if (!store.currentRound) {
		return;
	}

	socket.emit(SOCKETS.WORD_CHECK, {
		gameId: store.currentRound.gameId,
		roundNumber: store.currentRound.roundNumber,
		word: wordGuess.value,
	});
}
</script>

<template>
	<div v-if="store.currentRound">
		<h1>Round {{ store.currentRound.roundNumber }}: {{ store.currentRound.text }}</h1>

		<input type="text" v-model="wordGuess" /> <input type="submit" @click="checkWord()" />

		<div>Score: {{ store.currentRound.score }}</div>
		<div :class="{ 'guess-result': guessResult }">
			<span v-if="guessResult">{{ guessResult }}</span>
		</div>
		<span v-if="store.currentRound.endTime">Round over</span>
	</div>
</template>

<style>
.guess-result {
	animation: fade;
}

@keyframes fade {
	0% {
		opacity: 1;
		visibility: visible;
	}
	100% {
		opacity: 0;
		visibility: hidden;
	}
}
</style>
