<script setup>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from '@/components/Footer.vue';
import { useNavbarStore } from '@/stores/navbar';

const navbarToggle = useNavbarStore();
</script>

<template>
	<Header />
	<Sidebar />
	<div
		class="flex-1 transition-all ease-in-out duration-75"
		:class="{
			'ml-16': ['auto', 'close'].includes(navbarToggle.getState),
			'ml-60': navbarToggle.getState === 'open',
		}"
	>
		<main class="p-4 mb-4 overflow-hidden">
			<slot />
		</main>
		<Footer />
	</div>
</template>
