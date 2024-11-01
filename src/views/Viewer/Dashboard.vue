<script setup>
import { ref, onBeforeMount } from 'vue';
import { useAuthStore } from '@/stores/auth';
import Authenticated from '@/layouts/Authenticated.vue';
import Loader from '@/components/Loader.vue';

const auth = useAuthStore();
const loading = ref(true);

onBeforeMount(() => {
	auth?.guard();
});
</script>

<template>
	<Authenticated>
		<Loader v-if="loading" />
	</Authenticated>
</template>
