<script setup lang="ts">
import { useGameStore } from '@/store/game';
import { computed } from 'vue';

const props = defineProps({
	height: Number,
	origin: String,
	text: String,
});
const gameStore = useGameStore();
const origin = props.origin?.toLowerCase() || gameStore.game?.origin.toLowerCase();
const originUrl = computed(() => {
	return new URL(`../assets/plates/${origin}.jpg`, import.meta.url).href;
});
const heightCssValue = computed(() => `${props.height}px`);
</script>

<template>
	<div class="base-plate" :class="origin">
		<img :src="originUrl" />
		<span class="plate-text">{{ props.text || gameStore.game?.plateText }}</span>
	</div>
</template>

<style lang="css">
@font-face {
	font-family: LicensePlate;
	src: url(../assets/fonts/LicensePlate.ttf);
}

/* TODO: Refactor. This is gonna get real big, real fast. */
.base-plate {
	height: v-bind(heightCssValue);
	text-align: center;
	container-type: size;

	img {
		height: 100%;
	}

	&.ca {
		img {
			filter: brightness(95%); /* The OG image is too damn bright. */
			border: 1px solid #999;
			border-radius: 10px;
		}

		.plate-text {
			font-family: LicensePlate;
			font-size: 65cqh;
			display: flex;
			align-items: center;
			position: relative;
			bottom: 70%;
			justify-content: center;
			color: #21175c;
			text-shadow: -4px -3px 0 #fff;
		}
	}

	&.wa {
		.plate-text {
			font-family: LicensePlate;
			font-size: 55cqh;
			display: flex;
			align-items: center;
			position: relative;
			bottom: 77%;
			justify-content: center;
			color: #21175c;
			text-shadow: -4px -3px 0 #ddd;
		}
	}
}
</style>
