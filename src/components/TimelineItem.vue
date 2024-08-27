<script setup>
import { Icon } from '@iconify/vue';

const props = defineProps({
	complete: {
		type: Boolean,
		required: false,
	},
	iconClass: {
		type: String,
		required: false,
	},
	lineClass: {
		type: String,
		required: false,
	},
	itemClass: {
		type: String,
		required: false,
	},
});
</script>

<template>
	<div
		class="transform transition ml-10 relative flex items-center mb-10 flex-col md:flex-row space-y-4 md:space-y-0"
	>
		<div
			class="w-8 h-8 absolute -left-10 transform -translate-x-2/4 rounded-full z-10 mt-2 md:mt-0 flex items-center justify-center font-bold text-sm"
			:class="props?.iconClass"
		>
			<template v-if="complete">
				<Icon icon="heroicons:check-solid" />
			</template>
			<slot v-else name="icon" />
		</div>

		<div
			class="w-10 h-0.5 absolute -left-10 z-0"
			:class="props?.lineClass ?? 'bg-slate-200'"
		></div>

		<div :class="props?.itemClass ?? 'grow px-6 py-3 rounded'">
			<slot name="item" />
		</div>
	</div>
</template>
