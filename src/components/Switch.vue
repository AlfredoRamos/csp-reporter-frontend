<script setup>
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
	},
	showIcons: {
		type: Boolean,
		default: true,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['update:modelValue']);

const activated = ref(props?.modelValue ?? false);
const disabled = ref(props?.disabled ?? false);

const toggle = () => {
	activated.value = !activated.value;
	emit('update:modelValue', activated.value);
};

watch(
	() => {
		return props?.modelValue;
	},
	(newValue) => {
		activated.value = newValue;
	},
	{ inmediate: true },
);

watch(
	() => {
		return props?.disabled;
	},
	(newValue) => {
		disabled.value = newValue;
	},
	{ inmediate: true },
);
</script>

<template>
	<div class="inline-block w-fit">
		<label
			class="relative flex items-center w-max select-none border border-gray-300 rounded-full shadow-sm"
			:class="{ 'cursor-not-allowed': disabled }"
		>
			<input
				ref="trigger"
				type="checkbox"
				class="appearance-none transition ease-in-out duration-75 w-10 h-5 rounded-full outline-none focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-25 disabled:bg-gray-300 disabled:text-gray-50 disabled:cursor-not-allowed"
				:class="{
					'bg-green-600': activated,
					'bg-slate-400': !activated,
				}"
				@click="toggle"
				v-model.number="activated"
				:disabled="disabled"
			/>
			<div
				class="absolute left-1 text-gray-50"
				v-if="props.showIcons === true && activated"
			>
				<Icon icon="heroicons:check-solid" class="w-3 h-3 ml-0.5" />
			</div>
			<div
				class="absolute right-1 text-gray-50 block"
				v-if="props.showIcons === true && !activated"
			>
				<Icon icon="heroicons:x-mark-solid" class="w-3 h-3 mr-0.5" />
			</div>
			<div
				class="w-5 h-5 absolute rounded-full bg-gray-200 transition ease-in-out duration-75 shadow-sm"
				:class="{
					'translate-x-full': activated,
					'translate-x-0': !activated,
				}"
			></div>
		</label>
	</div>
</template>
