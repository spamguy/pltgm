<script setup lang="ts">
import { useGameStore } from '@/store/game';

const gameStore = useGameStore();
</script>

<template>
	<div class="base-plate" :class="gameStore.game.origin.toLowerCase()" v-if="gameStore.game">
		<span>{{ gameStore.game.text }}</span>
	</div>
</template>

<style lang="css">
@font-face {
	font-family: LicensePlate;
	src: url(./src/assets/fonts/LicensePlate.ttf);
}

.base-plate {
	border: 1px solid black;
	border-radius: 20px;
	margin: 0 10px;
	height: 400px;
	text-align: center;
}

.ca {
	font-family: LicensePlate;
	font-size: 120pt;
	background-image: url(./src/assets/plates/ca.svg);
}
</style>
