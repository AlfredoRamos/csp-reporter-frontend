<script setup>
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
	class: {
		type: String,
	},
	type: {
		type: String,
		default: () => {
			return 'info';
		},
		validator: (value) => {
			return ['info', 'success', 'warning', 'error'].includes(value);
		},
	},
	title: {
		type: String,
	},
});
const emit = defineEmits(['close']);

const open = ref(true);
let timeout = null;

const handleClose = () => {
	open.value = false;
	emit('close');
};

const handleDismiss = () => {
	clearTimeout(timeout);

	timeout = setTimeout(() => {
		open.value = false;
		emit('close');
	}, 5000);
};

const handleHoverEnter = () => {
	clearTimeout(timeout);
};

const handleHoverLeave = () => {
	handleDismiss();
};

onMounted(() => {
	handleDismiss();
});
</script>

<template>
	<Transition
		enter-active-class="duration-75 ease-out transition"
		enter-from-class="transform opacity-0"
		enter-to-class="opacity-100"
		leave-active-class="duration-75 ease-in transition"
		leave-from-class="opacity-100"
		leave-to-class="transform opacity-0"
	>
		<div
			v-if="open"
			class="w-96 h-max max-h-48 overflow-x-hidden overflow-y-auto text-gray-50 rounded-md shadow-md"
			:class="{
				'bg-sky-600': props?.type === 'info',
				'bg-green-600': props?.type === 'success',
				'bg-yellow-600': props?.type === 'warning',
				'bg-red-600': props?.type === 'error',
				[props?.class]: props?.class?.length > 0,
			}"
			@mouseover="handleHoverEnter"
			@mouseleave="handleHoverLeave"
		>
			<div class="relative w-full h-full p-2">
				<div
					class="absolute top-1 right-1 p-2 cursor-pointer"
					title="Cerrar"
					@click.prevent="handleClose"
				>
					<Icon
						icon="heroicons:x-mark-solid"
						class="w-5 h-5 transition ease-in-out duration-75 text-gray-300 hover:text-white"
					/>
				</div>
				<div class="w-full flex flex-col flex-wrap gap-2">
					<div
						v-if="props?.title"
						class="font-semibold whitespace-nowrap"
					>
						<Icon
							v-if="props?.type === 'info'"
							icon="heroicons:information-circle-solid"
							class="w-5 h-5 inline-block ml-1"
						/>
						<Icon
							v-if="props?.type === 'success'"
							icon="heroicons:check-circle-solid"
							class="w-5 h-5 inline-block ml-1"
						/>
						<Icon
							v-if="props?.type === 'warning'"
							icon="heroicons:exclamation-circle-solid"
							class="w-5 h-5 inline-block ml-1"
						/>
						<Icon
							v-if="props?.type === 'error'"
							icon="heroicons:x-circle-solid"
							class="w-5 h-5 inline-block ml-1"
						/>
						{{ props?.title }}
					</div>
					<div class="overflow-y-auto">
						<slot />
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>
