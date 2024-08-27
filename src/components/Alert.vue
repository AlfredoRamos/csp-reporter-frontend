<script setup>
import { Icon } from '@iconify/vue';

const props = defineProps({
	class: {
		type: String,
	},
	type: {
		type: String,
		default: 'info',
	},
	title: {
		type: String,
	},
	narrow: {
		type: Boolean,
		default: true,
	},
});
</script>

<template>
	<div
		class="flex gap-2 p-4 shadow mb-4 rounded-md"
		:class="{
			'bg-sky-50 text-sky-900': props?.type === 'info',
			'bg-green-50 text-green-900': props?.type === 'success',
			'bg-yellow-50 text-yellow-900': props?.type === 'warning',
			'bg-red-50 text-red-900': props?.type === 'error',
			'flex-col items-start justify-center': props?.title,
			[props?.class]: props?.class?.length > 0,
		}"
	>
		<div
			class="font-semibold"
			:class="{ 'w-full whitespace-nowrap': props?.title }"
		>
			<Icon
				v-if="props?.type === 'info'"
				icon="heroicons:information-circle-solid"
				class="w-5 h-5"
				:class="{
					'inline-block': props?.title,
					'inline align-middle': !props?.title,
				}"
			/>
			<Icon
				v-if="props?.type === 'success'"
				icon="heroicons:check-circle-solid"
				class="w-5 h-5"
				:class="{
					'inline-block': props?.title,
					'inline align-middle': !props?.title,
				}"
			/>
			<Icon
				v-if="props?.type === 'warning'"
				icon="heroicons:exclamation-triangle-solid"
				class="w-5 h-5"
				:class="{
					'inline-block': props?.title,
					'inline align-middle': !props?.title,
				}"
			/>
			<Icon
				v-if="props?.type === 'error'"
				icon="heroicons:x-circle-solid"
				class="w-5 h-5"
				:class="{
					'inline-block': props?.title,
					'inline align-middle': !props?.title,
				}"
			/>
			<template v-if="props?.title">{{ props?.title }}</template>
		</div>
		<div
			class="w-full"
			:class="{
				grow: !props?.title,
				'break-all line-clamp-2': props?.narrow,
			}"
		>
			<slot />
		</div>
	</div>
</template>
