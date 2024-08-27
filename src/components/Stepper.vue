<script setup>
import { Icon } from '@iconify/vue';
import { useStepper } from '@vueuse/core';

const props = defineProps({
	steps: {
		type: Object,
		required: true,
	},
});
const stepper = useStepper(props?.steps);

defineExpose({ stepper });

const arePreviousStepsValid = (index) => {
	return !Array(index)
		.fill(null)
		.some((_, i) => !stepper.at(i)?.isValid());
};
</script>

<template>
	<div class="flex flex-col gap-4">
		<div class="max-w-lg mx-auto flex w-full">
			<div
				v-for="(step, id, i) in stepper.steps.value"
				:key="id"
				class="flex items-center after:transition after:ease-in-out after:duration-75"
				:class="{
					'w-full after:w-full after:border-2 after:border-b':
						i < Object.entries(stepper.steps.value).length - 1,
					'after:border-green-600/70': stepper.isAfter(id),
				}"
			>
				<button
					type="button"
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full cursor-pointer transition ease-in-out duration-75 disabled:bg-gray-300 disabled:text-gray-50 disabled:cursor-not-allowed"
					:class="{
						'bg-gray-500 text-gray-50': stepper.isCurrent(id),
						'bg-gray-300 text-gray-50': stepper.isBefore(id),
						'bg-gray-300 text-white': stepper.isAfter(id),
					}"
					:disabled="
						!arePreviousStepsValid(i) && stepper.isBefore(id)
					"
					@click="stepper.goTo(id)"
					:title="step?.title"
				>
					<Icon
						v-if="stepper.isAfter(id)"
						icon="heroicons:check-solid"
						class="w-5 h-5"
					/>
					<template v-else>{{ i + 1 }}</template>
				</button>
			</div>
		</div>
		<div class="transition-all ease-in-out duration-75">
			<template v-for="(step, id, i) in stepper.steps.value" :key="id">
				<Transition
					enter-active-class="duration-200 ease-out"
					enter-from-class="transform-all opacity-0 translate-x-full h-0"
					enter-to-class="opacity-100 translate-x-0 h-fit"
					leave-active-class="duration-200 ease-in"
					leave-from-class="opacity-100 translate-x-0 h-fit"
					leave-to-class="transform-all opacity-0 translate-x-full h-0"
				>
					<div v-if="stepper.isCurrent(id)">
						<slot :name="`step-${i + 1}`" />
					</div>
				</Transition>
			</template>
		</div>
	</div>
</template>
