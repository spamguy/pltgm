<script setup lang="ts">
import { useGameStore } from '@/store/game';

const store = useGameStore();
</script>

<template>
	<button @click="store.startGame()">New Game</button>
</template>
