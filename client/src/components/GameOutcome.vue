<script setup lang="ts">
import { useGameStore } from '@/store/game';

const gameStore = useGameStore();
</script>

<template>
	<div>
		<h1>Your score: {{ gameStore.game?.score || 0 }}</h1>

		<button @click="gameStore.$reset()">OK</button>
	</div>
</template>

<style scoped></style>
