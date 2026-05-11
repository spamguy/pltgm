<script setup lang="ts">
import { useGameStore } from '@/store/game';
import ScoreOdometer from './ScoreCounter.vue';

const gameStore = useGameStore();
</script>

<template>
	<div>
		<h1>Your score:</h1>
		<ScoreOdometer />

		<button @click="gameStore.$reset()">OK</button>
	</div>
</template>

<style scoped></style>
