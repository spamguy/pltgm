<template>
	<div class="sign">
		<div class="border">
			<div class="content">
				<slot />
			</div>
		</div>
	</div>
</template>

<style scoped lang="css">
.sign {
	background-color: #006b54;
	padding: 0.25em;
	border-radius: 20px;
	height: 80px;
	min-width: 80px;
	cursor: pointer;
	position: relative;
	overflow: hidden;
}

/* For shine effect. */
.sign::after {
	content: '';
	position: absolute;
	inset: 0;
	border-radius: inherit;
	pointer-events: none;
	background: linear-gradient(
		115deg,
		rgba(255, 255, 255, 0) 30%,
		rgba(255, 255, 255, 0.12) 42%,
		rgba(255, 255, 255, 0.05) 50%,
		rgba(255, 255, 255, 0) 62%
	);
	transition: transform 0.2s ease-out;
}

.sign:hover::after {
	transform: translateX(10px);
}

.border {
	border: solid 0.1em white;
	border-radius: 18px;
	padding: 0.5em 0.75em;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;

	font-family: 'Overpass', sans-serif;
	font-size: 20pt;
}

.content {
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	line-height: 1;
	color: #ffffff;
}
</style>
