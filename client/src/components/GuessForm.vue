<script setup lang="ts">
import { SOCKETS } from '#common/constants';
import { socket } from '@/sockets';
import { useGameStore } from '@/store/game';
import { ref } from 'vue';

const gameStore = useGameStore();
const wordGuess = ref('');

function checkWord() {
	if (!gameStore.game || !wordGuess.value) {
		return;
	}

	socket.emit(SOCKETS.WORD_CHECK, {
		gameId: gameStore.game.id,
		word: wordGuess.value,
	});

	// Clear field for next guess.
	wordGuess.value = '';
}
</script>

<template>
	<div class="guess-container" data-tour-guide="guess-form">
		<form @submit.prevent="checkWord()">
			<input type="text" placeholder="Guess word here. . ." v-model="wordGuess" />
			<div class="btn-container">
				<button type="submit"><span>Check</span></button>
			</div>
		</form>
	</div>
</template>

<style lang="css">
.guess-container {
	form {
		display: flex;
		justify-content: center;

		input:focus,
		button:focus {
			outline-offset: 20px;
			outline: 2px dotted #777777;
		}

		input[type='text'] {
			background: transparent;
			color: black;
			font-size: 36pt;
			font-style: italic;
			font-family: 'DSEG14 Modern';
			margin-right: 15px;
			width: 600px;

			--display-color: rgba(153, 191, 180, 0.5);
			-webkit-box-shadow: 0px 0px 29px 1px var(--display-color);
			-moz-box-shadow: 0px 0px 29px 1px var(--display-color);
			box-shadow: 0px 0px 29px 1px var(--display-color);
			background-color: var(--display-color);

			&::placeholder {
				color: rgb(115, 142, 134);
			}
		}

		.btn-container {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 5em;
			height: 4.1em;
			background-color: #171717;
			border-radius: 5px;

			button {
				width: 5.7em;
				height: 4.4em;
				border-radius: 10px;
				border: none;
				outline: none;
				background-color: #555555;
				box-shadow:
					rgba(0, 0, 0, 0.377) 5px 5px 4px,
					#333333 1.5px 1.5px 2px 0px inset,
					#343434 -3.2px -3.2px 8px 0px inset;
				cursor: pointer;
				text-transform: uppercase;
				transition: 0.1s ease-in-out;
			}

			button:active {
				box-shadow:
					rgba(0, 0, 0, 0.377) 0px 0px 0px,
					inset 0.5px 0.5px 4px #000000,
					#222 -3.2px -3.2px 8px 0px inset;
			}

			button span {
				display: inline-block;
				transition: 0.1s ease-in-out;
				color: #bababa;
				text-shadow:
					0 1px 2px rgba(255, 255, 255, 0.4),
					0 -1px 1px rgba(0, 0, 0, 0.85);
			}

			button:active span {
				scale: 0.95;
			}
		}
	}
}
</style>
