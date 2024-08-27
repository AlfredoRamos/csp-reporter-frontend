<script setup>
import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Authenticated from '@/layouts/Authenticated.vue';

const router = useRouter();
const auth = useAuthStore();

onBeforeMount(() => {
	if (!auth?.accessToken) {
		auth?.clean();
		router.push({ name: 'auth_login' });
		return;
	}
});
</script>

<template>
	<Authenticated> </Authenticated>
</template>
