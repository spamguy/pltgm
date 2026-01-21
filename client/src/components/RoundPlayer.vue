<script setup lang="ts">
import { SOCKETS } from '#common/constants';
import { socket } from '@/sockets';
import { useGameStore } from '@/store/game';
import { ref } from 'vue';

const store = useGameStore();
const wordGuess = ref('');

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

		Score: {{ store.currentRound.score }}

		<input type="text" v-model="wordGuess" /> <input type="submit" @click="checkWord()" />
	</div>
</template>
