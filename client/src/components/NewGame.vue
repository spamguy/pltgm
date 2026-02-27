<script setup lang="ts">
import { useGameStore } from '@/store/game';
import LicensePlate from './LicensePlate.vue';

const store = useGameStore();
</script>

<template>
	<div>
		<LicensePlate text="PLTGM" origin="CA" :height="300"></LicensePlate>
		<div class="button-container"><button @click="store.startGame()">New Game</button></div>
	</div>
</template>

<style lang="css">
.button-container {
	width: 100%;
	margin-top: 15px;
	display: flex;
	justify-content: center;
}
</style>
