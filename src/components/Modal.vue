<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
	showButtons: {
		type: Boolean,
		required: false,
		default: true,
	},
});

const emit = defineEmits(['accept', 'cancel', 'close']);
const open = ref(false);

defineExpose({ open });

const closeOnEscape = (e) => {
	if (open.value && e.key === 'Escape') {
		open.value = false;
		emit('cancel');
		emit('close');
	}
};

const handleClose = () => {
	open.value = false;
	emit('cancel');
	emit('close');
};

onMounted(() => document.addEventListener('keydown', closeOnEscape));
onUnmounted(() => document.removeEventListener('keydown', closeOnEscape));
</script>

<template>
	<Teleport v-if="open" to="body">
		<div
			class="flex items-center justify-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-11/12 lg:w-6/12"
		>
			<div
				class="relative bg-white border rounded shadow-md px-4 py-2 w-full max-h-[92vh] overflow-hidden"
			>
				<div
					class="absolute top-1 right-1 p-2 cursor-pointer"
					title="Cerrar"
					@click="handleClose"
				>
					<Icon
						icon="heroicons:x-mark-solid"
						class="w-5 h-5 transition ease-in-out duration-75 text-gray-600 hover:text-gray-900"
					/>
				</div>
				<div class="w-full flex flex-col flex-wrap gap-2">
					<div
						class="modal-title font-semibold text-center text-lg text-gray-700"
					>
						<slot name="title" />
					</div>
					<div class="modal-body w-full max-h-[78vh] overflow-auto">
						<slot name="content" />
					</div>
					<div
						v-if="props?.showButtons"
						class="modal-footer flex items-center justify-center gap-4 border-t pt-2 text-sm"
					>
						<slot name="footer">
							<button
								type="button"
								class="rounded transition ease-in-out duration-75 bg-red-700 hover:bg-red-700/70 text-gray-100 hover:text-gray-50 px-2 py-1 whitespace-nowrap disabled:cursor-not-allowed"
								@click.prevent="emit('cancel')"
							>
								<Icon
									icon="heroicons:x-mark-solid"
									:inline="true"
									class="inline-block ml-1"
								/>
								Cancel
							</button>
							<button
								type="button"
								class="rounded transition ease-in-out duration-75 bg-green-700 hover:bg-green-700/70 text-gray-100 hover:text-gray-50 px-2 py-1 whitespace-nowrap disabled:cursor-not-allowed"
								@click.prevent="emit('accept')"
							>
								<Icon
									icon="heroicons:check-solid"
									:inline="true"
									class="inline-block ml-1"
								/>
								Accept
							</button>
						</slot>
					</div>
				</div>
			</div>
		</div>
		<div
			v-if="open"
			class="fixed inset-0 z-10 bg-black/25 backdrop-blur-sm cursor-pointer"
			@click.prevent="handleClose"
		></div>
	</Teleport>
</template>
