<script setup lang="ts">
import { useGameStore } from '@/store/game';
import HighScoreRow from './HighScoreRow.vue';
import ScoreOdometer from './ScoreCounter.vue';

const gameStore = useGameStore();
</script>

<template>
	<div class="layout">
		<div class="score-container">
			<h1>Your score:</h1>
			<ScoreOdometer />
			<button @click="gameStore.$reset()">OK</button>
		</div>

		<div class="high-score-container">
			<table>
				<tbody>
					<HighScoreRow v-for="hs in gameStore.highScores" v-bind:key="hs.id" :high-score="hs" />
				</tbody>
			</table>
		</div>
	</div>
</template>

<style scoped>
.layout {
	display: flex;
}

tbody:has(tr.editing) tr:not(.editing) {
	opacity: 0.4;
}
</style>
