<script setup lang="ts">
import { SOCKETS } from '#common/constants';
import { PlateOriginsList, type HighScore } from '#common/types';
import { socket } from '@/sockets';
import { computed, ref, watch } from 'vue';
import LicensePlate from './LicensePlate.vue';

const props = defineProps<{ highScore: HighScore }>();
const emit = defineEmits<{ editing: [isEditing: boolean] }>();

const error = ref('');
const scoreForm = ref({
	plateText: props.highScore.text,
	origin: props.highScore.origin ?? PlateOriginsList[0],
});
const isCancelled = ref(false);
const isSaved = ref(false);
const isEditing = computed(
	() =>
		props.highScore.isCurrentGame &&
		!isSaved.value &&
		!isCancelled.value &&
		!!isScoreVisible(props.highScore),
);

watch(isEditing, (editing) => emit('editing', editing), { immediate: true });

function isScoreVisible({ score }: HighScore) {
	return score > 0;
}

function onCancel() {
	isCancelled.value = true;
}

// Validate as the player types, not just on submit.
watch(scoreForm, validate, { deep: true });

function validate() {
	error.value = '';

	if (!scoreForm.value.plateText) {
		error.value = 'Provide a name for your high score, or click Cancel to skip.';
	} else if (!scoreForm.value.origin) {
		error.value = 'Provide a plate template for your high score, or click Cancel to skip.';
	} else if (!/^[A-Za-z0-9]{1,7}$/.test(scoreForm.value.plateText)) {
		error.value = 'Plate text must be under eight letters or numbers long.';
	}

	return !error.value;
}

function onSubmit() {
	// Block submission.
	if (!validate()) {
		return;
	}

	socket.emit(
		SOCKETS.GAME_HIGH_SCORE,
		{ ...props.highScore, text: scoreForm.value.plateText, origin: scoreForm.value.origin },
		(saved: boolean) => {
			isSaved.value = saved;
		},
	);
}
</script>

<template>
	<tr v-if="!isCancelled && isScoreVisible(highScore)" :class="{ editing: isEditing }">
		<td v-if="isEditing">
			<p class="blink glow">New high score</p>
			<p v-if="error" class="error" role="alert">{{ error }}</p>

			<form @submit.prevent="onSubmit" novalidate>
				<LicensePlate
					v-model:text="scoreForm.plateText"
					:origin="scoreForm.origin"
					editable
					class="plate"
				></LicensePlate>
				<p>
					<select v-model="scoreForm.origin">
						<option v-for="o in PlateOriginsList" :key="o" :value="o">{{ o }}</option>
					</select>
					<button type="submit">OK</button>
					<button type="button" @click="onCancel">Cancel</button>
				</p>
			</form>
		</td>
		<td v-else>
			<LicensePlate
				:text="scoreForm.plateText"
				:origin="scoreForm.origin"
				class="plate"
			></LicensePlate>
		</td>
		<td class="score">{{ highScore.score }}</td>
	</tr>
</template>

<style lang="css" scoped>
tr {
	/* 'backwards' keeps rows hidden during their delay without pinning opacity afterward. */
	animation: slide-up 400ms ease-out backwards;
	animation-delay: calc(var(--row-index, 0) * 150ms);
}

@keyframes slide-up {
	from {
		opacity: 0;
		transform: translateY(100%);
	}
}

.blink {
	animation: blink 1s step-end infinite;
	font-family: 'DSEG14 Modern';
	color: orange;
	--glow-color: orange;
}

@keyframes blink {
	80% {
		visibility: hidden;
	}
}

@media (prefers-reduced-motion: reduce) {
	tr,
	.blink {
		animation: none;
	}
}

td {
	padding-bottom: 20px;

	&.score {
		font-family: 'DSEG7 Modern';
		text-align: right;
	}

	.plate {
		width: 100px;
	}
}
</style>
