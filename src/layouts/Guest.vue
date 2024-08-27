<script setup>
import { RouterLink } from 'vue-router';
import ApplicationLogo from '@/components/ApplicationLogo.vue';
import Footer from '@/components/Footer.vue';

const props = defineProps({
	wide: {
		type: Boolean,
		default: false,
	},
});
</script>

<template>
	<div
		class="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0"
	>
		<RouterLink :to="{ name: 'home' }" class="block mb-4">
			<ApplicationLogo />
		</RouterLink>

		<div
			class="w-full px-6 py-4 bg-white shadow-md overflow-hidden rounded-md"
			:class="{
				'sm:max-w-4xl': props?.wide,
				'sm:max-w-2xl': !props?.wide,
			}"
		>
			<slot />
		</div>

		<Footer class="w-full mt-6" />
	</div>
</template>
