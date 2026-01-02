<script setup lang="ts">
import { useGameStore } from '@/store/game';

// socket.emit('game:create', registerNewGame);
const store = useGameStore();
</script>

<template>
	<button @click="store.startGame()">New Game</button>
</template>
