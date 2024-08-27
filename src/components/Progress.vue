<script setup>
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue';

const completed = ref(false);
const progress = ref(0);
let timeout = null;

watch(progress, (newVal) => {
	clearTimeout(timeout);
	timeout = setTimeout(() => {
		completed.value = newVal >= 100;
	}, 1500);
});

defineExpose({ completed, progress });
</script>

<style scoped>
progress[value]::-webkit-progress-bar,
progress[value]::-moz-progress-bar {
	background-color: rgb(249 250 251);
}
</style>

<template>
	<Transition
		enter-active-class="duration-75 ease-out"
		enter-from-class="transform opacity-0"
		enter-to-class="opacity-100"
		leave-active-class="duration-75 ease-in"
		leave-from-class="opacity-100"
		leave-to-class="transform opacity-0"
	>
		<div
			v-if="!completed"
			class="flex flex-wrap items-center justify-center gap-2 w-full md:w-64 bg-gray-300 text-gray-50 rounded shadow-md p-2 select-none"
		>
			<Icon v-if="progress >= 100" icon="heroicons:check-circle-solid" />
			<Icon v-else icon="svg-spinners:tadpole" />
			<progress
				class="grow border border-gray-50 bg-transparent rounded h-2 appearance-none"
				max="100"
				:value="progress"
			></progress>
			<div class="font-semibold font-mono text-sm">{{ progress }}%</div>
		</div>
	</Transition>
</template>
