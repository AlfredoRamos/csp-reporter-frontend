<script setup>
import { ref, onBeforeMount, inject } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import Authenticated from '@/layouts/Authenticated.vue';
import NotificationArea from '@/components/NotificationArea.vue';
import Notification from '@/components/Notification.vue';
import { useAuthStore } from '@/stores/auth';
import endpoints from '@/modules/endpoints';

const http = inject('http');
const router = useRouter();
const auth = useAuthStore();
const loading = ref(false);
const notifications = ref([]);

const handleCachePurge = () => {
	loading.value = true;
	http.post(
		endpoints?.system?.cache?.purge,
		{},
		{
			headers: {
				Authorization: `Bearer ${auth?.accessToken}`,
			},
		},
	)
		.then(() => {
			notifications.value?.push({
				type: 'success',
				title: 'Cache purge successful',
				message: 'The cache has been purged successfully.',
			});
		})
		.catch((error) => {
			notifications.value?.push({
				type: 'error',
				title: 'Cache purge failed',
				message: error?.response?.data?.error?.join('\n'),
			});
		})
		.then(() => {
			loading.value = false;
		});
};

onBeforeMount(() => {
	if (!auth?.accessToken) {
		auth?.clean();
		router.push({ name: 'auth_login' });
		return;
	}
});
</script>

<template>
	<Authenticated>
		<div class="flex flex-wrap items-center gap-4 mb-4">
			<button
				type="button"
				class="whitespace-nowrap bg-sky-600 hover:bg-sky-600/70 text-gray-50 hover:text-white transition ease-in-out duration-75 px-2 py-1 rounded w-fit disabled:cursor-not-allowed"
				@click.prevent="handleCachePurge"
				:disabled="loading"
			>
				<Icon
					icon="heroicons:fire-solid"
					:inline="true"
					class="inline-block mr-1"
				/>
				Purge cache
			</button>
		</div>
	</Authenticated>

	<NotificationArea>
		<Notification
			v-for="(notification, index) in notifications"
			:key="index"
			:type="notification?.type"
			:title="notification?.title"
			>{{ notification?.message }}</Notification
		>
	</NotificationArea>
</template>
