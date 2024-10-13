<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Authenticated from '@/layouts/Authenticated.vue';
import Loader from '@/components/Loader.vue';

const router = useRouter();
const auth = useAuthStore();
const loading = ref(true);

onBeforeMount(async () => {
	if (!auth?.accessToken) {
		auth?.clean();
		router.push({ name: 'auth_login' });
		return;
	}

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
