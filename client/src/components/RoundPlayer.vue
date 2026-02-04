<script setup lang="ts">
import { SOCKETS } from '#common/constants';
import { socket } from '@/sockets';
import { useGameStore } from '@/store/game';
import { useRoundStore } from '@/store/round';
import { ref } from 'vue';

const gameStore = useGameStore();
const roundStore = useRoundStore();
const wordGuess = ref('');
const guessResult = ref('');

// onMounted(() => {
gameStore.setupSockets();
roundStore.setupSockets();
// });

function checkWord() {
	if (!gameStore.currentRound || !wordGuess.value) {
		return;
	}

	socket.emit(SOCKETS.WORD_CHECK, {
		gameId: gameStore.currentRound.gameId,
		roundNumber: gameStore.currentRound.roundNumber,
		word: wordGuess.value,
	});
}
</script>

<template>
	<div v-if="gameStore.currentRound">
		<h1>Round {{ gameStore.currentRound.roundNumber }}: {{ gameStore.currentRound.text }}</h1>

		<h2>{{ roundStore.timer.seconds + 60 * roundStore.timer.minutes }}</h2>

		<input type="text" v-model="wordGuess" /> <input type="submit" @click="checkWord()" />

		<div>Score: {{ roundStore.currentScore }}</div>
		<div :class="{ 'guess-result': guessResult }">
			<span v-if="guessResult">{{ guessResult }}</span>
		</div>
		<span v-if="gameStore.currentRound.endTime">Round over</span>
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
