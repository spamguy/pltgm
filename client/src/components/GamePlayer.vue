<script setup lang="ts">
import { SOCKETS } from '#common/constants';
import { socket } from '@/sockets';
import { useGameStore } from '@/store/game';
import { computed, ref } from 'vue';

const gameStore = useGameStore();
const wordGuess = ref('');
const guessResult = ref('');
const formattedTimer = computed(() => {
	const seconds = (gameStore.timer / 1000).toFixed(1);

	return `${seconds} seconds`;
});

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
		<h1>{{ gameStore.game.text }}</h1>

		<h2>{{ formattedTimer }}</h2>

		<input type="text" v-model="wordGuess" /> <input type="submit" @click="checkWord()" />

		<div>Score: {{ gameStore.game.score }}</div>
		<div :class="{ 'guess-result': guessResult }">
			<span v-if="guessResult">{{ guessResult }}</span>
		</div>
		<span v-if="gameStore.game.endTime">Round over</span>
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
