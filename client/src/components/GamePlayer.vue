<script setup lang="ts">
import { useGameStore } from '@/store/game';
import { computed } from 'vue';
import GuessForm from './GuessForm.vue';
import LicensePlate from './LicensePlate.vue';
import ScoreCounter from './ScoreCounter.vue';

const gameStore = useGameStore();
const formattedTimer = computed(() => {
	const seconds = (gameStore.timer / 1000).toFixed(1);

	return `${seconds} seconds`;
});
</script>

<template>
	<div v-if="gameStore.game" class="game-container">
		<div class="plate-container embedded">
			<LicensePlate></LicensePlate>
		</div>

		<div class="status-container embedded">
			<h2 v-if="gameStore.timer > 0">{{ formattedTimer }}</h2>

			<ScoreCounter />
		</div>
	</div>

	<GuessForm />
</template>

<style lang="css">
.game-container {
	display: flex;
	flex-wrap: wrap;
	container-type: inline-size;
	width: 100%;
	padding: 20px;
	gap: 20px;

	.status-container {
		text-align: center;
		flex: 1 0 0;
		min-width: 0;
	}

	.plate-container {
		flex: 1;
	}

	.embedded {
		border-radius: 22px;
		box-shadow:
			inset 5px 5px 10px #141414,
			inset -5px -5px 10px #303030;
		padding: 20px;
	}

	@container (width < 900px) {
		.plate-container,
		.status-container {
			flex: 0 0 100%;
			max-width: none;
		}
	}
}
</style>
