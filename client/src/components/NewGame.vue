<script setup lang="ts">
import fetcher from '@/fetcher';

async function createNewGame() {
	// socket.emit('game:create', registerNewGame);
	const response = await fetcher('/games', { method: 'POST' });
}
</script>

<template>
	<button @click="createNewGame">New Game</button>
</template>
