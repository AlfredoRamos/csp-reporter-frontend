<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Authenticated from '@/layouts/Authenticated.vue';
import Loader from '@/components/Loader.vue';

const router = useRouter();
const auth = useAuthStore();
const loading = ref(true);

onBeforeMount(() => {
	auth?.guard().catch(() => {
		loading.value = false;
		router.push({ name: 'auth_login' });
		return;
	});
});
</script>

<template>
	<Authenticated>
		<Loader v-if="loading" />
	</Authenticated>
</template>
