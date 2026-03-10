<script setup lang="ts">
import { useGameStore } from '@/store/game';
import { computed } from 'vue';

const props = defineProps({
	height: Number,
	origin: String,
	text: String,
});
const gameStore = useGameStore();
const platePath = computed(() => {
	return `../src/assets/plates/${props.origin?.toLowerCase() || gameStore.game?.origin.toLowerCase()}.jpg`;
});
const heightCssValue = computed(() => `${props.height}px`);
</script>

<template>
	<div
		class="base-plate"
		:class="props.origin?.toLowerCase() || gameStore.game?.origin.toLowerCase()"
	>
		<img :src="platePath" />
		<span class="plate-text">{{ props.text || gameStore.game?.text }}</span>
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
