<script setup lang="ts">
import { useGameStore } from '@/store/game';
import { ref } from 'vue';
import GithubIcon from './GithubIcon.vue';
import LicensePlate from './LicensePlate.vue';
import SignButton from './SignButton.vue';

const store = useGameStore();
const openGithub = () => window.open('https://github.com/spamguy/pltgm', '_blank');

const isHelpHovered = ref(false);
const isGitHubHovered = ref(false);
const helpDialog = ref<HTMLElement | null>(null);
const showHelp = () => (helpDialog.value as HTMLDialogElement)?.showModal();
</script>

<template>
	<div class="new-game-container">
		<LicensePlate text="PLTGM" origin="CA" class="new-game-item"></LicensePlate>

		<table class="button-container new-game-item">
			<tbody>
				<tr>
					<td>
						<SignButton
							@click="showHelp"
							@mouseenter="isHelpHovered = true"
							@mouseleave="isHelpHovered = false"
						>
							?
						</SignButton>
					</td>
					<td>
						<SignButton
							id="github-link"
							@click="openGithub"
							@mouseenter="isGitHubHovered = true"
							@mouseleave="isGitHubHovered = false"
						>
							<GithubIcon />
						</SignButton>
					</td>
					<td></td>
					<td>
						<SignButton @click="store.startGame()">New Game</SignButton>
					</td>
				</tr>
				<tr>
					<td class="sign-label"><span v-if="isHelpHovered">Help</span></td>
					<td class="sign-label"><span v-if="isGitHubHovered">GitHub</span></td>
					<td></td>
					<td></td>
				</tr>
			</tbody>
		</table>

		<dialog
			ref="helpDialog"
			id="help-dialog"
			@click.self="($event.target as HTMLDialogElement).close()"
		>
			<h1>Welcome to PLTGM!</h1>
			<h2>(pronounced: 'plate game' or 'pultgum')</h2>

			<div class="dialog-content">
				<p>
					Your job is to find as many words in a supplied license plate as possible before time runs
					out.
				</p>
			</div>

			<div class="nav-container">
				<SignButton>Continue</SignButton>
			</div>
		</dialog>
	</div>
</template>

<style lang="css">
.new-game-container {
	display: flex;
	flex-direction: column;
	align-items: center;

	.new-game-item {
		width: 600px;
		height: auto;
	}
	.button-container {
		margin-top: 15px;
		table-layout: fixed;

		td {
			padding-left: 10px;
			padding-right: 10px;
		}

		td:nth-child(1) {
			width: 20%;
		}
		td:nth-child(2) {
			width: 20%;
		}
		td:nth-child(3) {
			width: 20%;
		}
		td:nth-child(4) {
			width: 40%;
		}

		td.sign-label {
			font-family: 'Overpass', sans-serif;
			text-align: center;
			font-size: 14pt;
			height: 28px;
		}

		svg {
			fill: white;
			height: 100%;
		}
	}

	dialog {
		border-radius: 18px;
		font-family: 'Overpass', sans-serif;
		padding: 25px;

		div.dialog-content {
			margin: 20px auto 30px auto;
			font-weight: 300;
		}
	}
}

dialog::backdrop {
	background-color: transparent;
	transition: background-color 300ms ease;
	transition-behavior: allow-discrete;
}

dialog[open]::backdrop {
	background-color: #505050;
}

@starting-style {
	dialog[open]::backdrop {
		background-color: transparent;
	}
}
</style>
