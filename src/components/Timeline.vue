<script setup>
const props = defineProps({
	containerClass: {
		type: String,
		required: false,
	},
});
</script>

<template>
	<div class="w-10/12 md:w-7/12 lg:6/12 mx-auto relative py-20">
		<div
			class="border-l-2"
			:class="props?.containerClass ?? 'border-slate-200'"
		>
			<slot />
		</div>
	</div>
</template>
