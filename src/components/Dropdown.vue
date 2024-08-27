<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const open = ref(false);
const emit = defineEmits(['close']);

defineExpose({ open });

const props = defineProps({
	triggerClass: {
		type: String,
		default: '',
	},
	openClass: {
		type: String,
		default: '',
	},
	contentClass: {
		type: String,
		default: 'w-48 mt-2',
	},
});

const closeOnEscape = (e) => {
	if (open.value && e.key === 'Escape') {
		handleClose();
	}
};

const toggle = () => {
	open.value = !open.value;

	if (open.value === false) {
		emit('close');
	}
};

const handleClose = () => {
	open.value = false;
	emit('close');
};

onMounted(() => document.addEventListener('keydown', closeOnEscape));
onUnmounted(() => document.removeEventListener('keydown', closeOnEscape));
</script>

<template>
	<div class="relative">
		<button
			class="rounded transition ease-in-out duration-75 px-2 py-1 disabled:cursor-not-allowed"
			:class="{
				[props?.triggerClass]: props?.triggerClass?.length > 0,
				[props?.openClass]:
					open === true && props?.openClass?.length > 0,
			}"
			@click.prevent="toggle"
		>
			<slot name="trigger" />
		</button>
		<div
			v-if="open"
			class="fixed inset-0 z-40"
			@click.prevent="handleClose"
		></div>
		<div
			v-if="open"
			class="absolute z-50 rounded shadow-md origin-top-right right-0 transform opacity-100 scale-100"
			:class="{ [props?.contentClass]: props?.contentClass?.length > 0 }"
		>
			<div
				class="rounded-md ring-1 ring-black ring-opacity-5 py-1 bg-white"
			>
				<slot name="content" />
			</div>
		</div>
	</div>
</template>
