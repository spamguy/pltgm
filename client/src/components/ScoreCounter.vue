<script setup lang="ts">
import { useGameStore } from '@/store/game';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const MIN_DIGITS = 4;
const gameStore = useGameStore();

const from = ref(0);
const to = ref(gameStore.game?.score || 0);
const current = ref(0);

const intStr = computed(() => {
	return String(Math.floor(Math.abs(current.value)));
});
const paddedDigits = computed(() => {
	const raw = intStr;
	const padLen = Math.max(MIN_DIGITS, raw.value.length);
	return raw.value
		.padStart(padLen, '0')
		.split('')
		.map((char, i) => ({
			char,
			isLeading: i < padLen - raw.value.length,
		}));
});

let raf: number | null = 0;

watch(
	() => gameStore.game?.score || 0,
	(newScore, oldScore) => {
		from.value = oldScore;
		to.value = newScore;
		current.value = oldScore;
		play();
	},
);

onMounted(() => play());

onBeforeUnmount(() => stop());

function play() {
	stop();
	const DURATION = 200;
	const t0 = performance.now();
	const step: FrameRequestCallback = (now) => {
		const p = Math.min((now - t0) / DURATION, 1);
		current.value = from.value + (to.value - from.value) * easeInOutQuad(p);
		if (p < 1) {
			raf = requestAnimationFrame(step);
		} else {
			current.value = to.value;
		}
	};
	raf = requestAnimationFrame(step);
}

function stop() {
	if (raf) {
		cancelAnimationFrame(raf);
		raf = null;
	}
}

function easeInOutQuad(t: number) {
	return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
</script>

<template>
	<div class="countup-display" :style="{ '--digit-count': MIN_DIGITS }">
		<span class="digits-wrapper">
			<span
				v-for="(digit, i) in paddedDigits"
				:key="i"
				class="digit"
				:class="{ leading: digit.isLeading }"
				>{{ digit.char }}</span
			>
		</span>
	</div>
</template>

<style lang="css" scoped>
.countup-display {
	display: inline-flex;
	align-items: baseline;
	font-variant-numeric: tabular-nums;
	gap: 0.05em;
	font-family: 'DSEG7 Modern';
	font-size: 6em;
}

.digits-wrapper {
	display: inline-flex;
	align-items: baseline;
}

.digit {
	display: inline-block;
	transition: color 0.2s;
	text-shadow: rgba(255, 255, 255, 0.4) 0 0 24px;
}

.digit.leading {
	color: var(--countup-leading-color, #aaa);
	text-shadow: #aaaaaa55 0 0 24px;
}
</style>
