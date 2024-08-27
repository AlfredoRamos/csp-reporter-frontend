<script setup>
import { Icon } from '@iconify/vue';
</script>

<template>
	<Teleport to="body">
		<div
			class="flex flex-col items-center justify-center gap-2 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
		>
			<Icon
				icon="svg-spinners:bars-scale"
				class="w-16 h-16 drop-shadow-md text-sky-700"
			/>
			<div class="text-center select-none text-white drop-shadow-md">
				Loading
				<Icon
					icon="svg-spinners:3-dots-move"
					:inline="true"
					class="inline-block"
				/>
			</div>
		</div>
		<div class="fixed inset-0 z-10 bg-black/25 backdrop-blur-sm"></div>
	</Teleport>
</template>
