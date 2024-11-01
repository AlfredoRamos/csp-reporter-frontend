<script setup>
import { onBeforeMount } from 'vue';
import { useAuthStore } from '@/stores/auth';
import Authenticated from '@/layouts/Authenticated.vue';

const auth = useAuthStore();

onBeforeMount(() => {
	auth?.guard();
});
</script>

<template>
	<Authenticated> </Authenticated>
</template>
