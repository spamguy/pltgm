<script setup lang="ts">
import { SOCKETS, WORD_CHECK_RESULT_MESSAGES } from '#common/constants';
import { socket } from '@/sockets';
import { useGameStore } from '@/store/game';
import { computed, nextTick, ref, watch } from 'vue';
import LicensePlate from './LicensePlate.vue';

const gameStore = useGameStore();
const wordGuess = ref('');
const guessResult = ref('');
const resultKey = ref(0);
const formattedTimer = computed(() => {
	const seconds = (gameStore.timer / 1000).toFixed(1);

	return `${seconds} seconds`;
});

watch(
	() => gameStore.results.length,
	() => {
		const latest = gameStore.results[gameStore.results.length - 1];
		if (!latest) return;
		// Force the animation to restart by toggling the element off then on.
		guessResult.value = '';
		nextTick(() => {
			guessResult.value = WORD_CHECK_RESULT_MESSAGES[latest[1]];
			resultKey.value++;
			wordGuess.value = '';
		});
	},
);

function checkWord() {
	if (!gameStore.game || !wordGuess.value) {
		return;
	}

	socket.emit(SOCKETS.WORD_CHECK, {
		gameId: gameStore.game.id,
		word: wordGuess.value,
	});
}
</script>

<template>
	<div v-if="gameStore.game">
		<LicensePlate :height="300"></LicensePlate>

		<h2>{{ formattedTimer }}</h2>

		<form @submit.prevent="checkWord()">
			<input type="text" v-model="wordGuess" />
			<input type="submit" />
		</form>

		<div>Score: {{ gameStore.game.score }}</div>
		<div v-if="guessResult" :key="resultKey" class="guess-result">{{ guessResult }}</div>
		<span v-if="gameStore.game.endTime">Round over</span>
	</div>
</template>

<style lang="css">
.guess-result {
	animation: fade 1.4s forwards;
}

@keyframes fade {
	0% {
		opacity: 1;
	}
	71% {
		opacity: 1;
	}
	100% {
		opacity: 0;
	}
}
</style>
