<script setup>
import { ref, onBeforeMount } from 'vue';
import { useAuthStore } from '@/stores/auth';
import Authenticated from '@/layouts/Authenticated.vue';
import Loader from '@/components/Loader.vue';

const auth = useAuthStore();
const loading = ref(true);

onBeforeMount(async () => {
	auth?.guard();

	// TODO: Make real API call
	setTimeout(() => {
		loading.value = false;
	}, 500);
});
</script>

<template>
	<Authenticated>
		<Loader v-if="loading" />
	</Authenticated>
</template>
