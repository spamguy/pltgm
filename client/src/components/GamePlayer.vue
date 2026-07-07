<script setup lang="ts">
import { useGameStore } from '@/store/game';
import { computed } from 'vue';
import GuessForm from './GuessForm.vue';
import LicensePlate from './LicensePlate.vue';
import ScoreCounter from './ScoreCounter.vue';

const gameStore = useGameStore();
const formattedTimer = computed(() => {
	const seconds = Math.floor(gameStore.timer / 1000);

	return `${seconds} s`;
});

const timerProgress = computed(() => Math.min((gameStore.timer / 60000) * 100, 100));
</script>

<template>
	<div v-if="gameStore.game" class="game-container">
		<div class="plate-container">
			<LicensePlate></LicensePlate>
		</div>

		<div class="status-container" :style="{ '--timer-progress': timerProgress }">
			<div class="status-inner">
				<ScoreCounter />
				<span class="score-units">pt</span>
			</div>

			<div v-if="gameStore.timer > 0" class="timer-label-wrap">
				<span class="timer-label">{{ formattedTimer }}</span>
			</div>
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
	max-width: 1100px;
	margin: 0 auto;
	padding: 20px;
	gap: 20px;

	.plate-container {
		flex: 1;
		padding-right: 40px;
	}

	.status-container {
		position: relative;
		flex: 0 0 30cqw;
		aspect-ratio: 1;
		border-radius: 50%;

		.score-units {
			width: 100%;
			text-align: right;
			font-family: 'DSEG7 Modern';
		}

		.status-inner {
			width: 80%;
			height: 100%;
			margin: 0 auto;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			container-type: inline-size;
			--score-font-size: 30cqi;
		}

		&::before {
			content: '';
			position: absolute;
			inset: -10px;
			border-radius: 50%;
			background: conic-gradient(
				from -180deg,
				white calc(var(--timer-progress) * 1%),
				transparent 0
			);
			mask: radial-gradient(circle, transparent calc(70% - 10px), black calc(70% - 10px));
			-webkit-mask: radial-gradient(circle, transparent calc(70% - 10px), black calc(70% - 10px));
			pointer-events: none;
		}

		.timer-label-wrap {
			position: absolute;
			inset: -25px;
			transform: rotate(calc(-180deg + var(--timer-progress) * 3.6deg));
			pointer-events: none;
		}

		.timer-label {
			position: absolute;
			top: 0;
			left: 50%;
			transform: translate(-50%, -50%) rotate(calc(180deg - var(--timer-progress) * 3.6deg));
			display: inline-block;
			white-space: nowrap;
			font-size: 0.85rem;
			font-weight: 600;
		}
	}

	@container (width < 900px) {
		.plate-container,
		.status-container {
			flex: 0 0 100%;
			max-width: none;
			aspect-ratio: auto;
			border-radius: 22px;
		}

		.status-container::before,
		.status-container .timer-label-wrap {
			display: none;
		}
	}
}
</style>
