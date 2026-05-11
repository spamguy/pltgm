<script setup lang="ts">
import { useGameStore } from '@/store/game';
import { computed } from 'vue';

const props = defineProps({
	origin: String,
	text: String,
});
const gameStore = useGameStore();
const origin = props.origin?.toLowerCase() || gameStore.game?.origin.toLowerCase();
const originUrl = computed(() => {
	return new URL(`../assets/plates/${origin}.jpg`, import.meta.url).href;
});
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
	height: 100%;
	position: relative;
	container-type: inline-size;

	img {
		width: 100%;
		height: auto;
		display: block;
	}

	&.ca {
		img {
			filter: brightness(95%); /* The OG image is too damn bright. */
			border: 1px solid #999;
			border-radius: 10px;
		}

		.plate-text {
			font-family: LicensePlate;
			font-size: 28cqw;
			line-height: 1;
			position: absolute;
			inset: 25% 0 0 0;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #21175c;
			text-shadow: -4px -3px 0 #fff;
		}
	}

	&.wa {
		.plate-text {
			font-family: LicensePlate;
			font-size: 17cqw;
			line-height: 1;
			position: absolute;
			inset: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #21175c;
			text-shadow: -4px -3px 0 #ddd;
		}
	}

	&.tx {
		img {
			border: 1px solid #999;
			border-radius: 10px;
		}

		.plate-text {
			font-family: LicensePlate;
			color: black;
			font-size: 26cqw;
			line-height: 1;
			position: absolute;
			inset: 30px 10px 0 0;
			display: flex;
			align-items: center;
			justify-content: center;
			letter-spacing: -2px;
		}
	}
}
</style>
