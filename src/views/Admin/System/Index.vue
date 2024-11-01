<script setup>
import { ref, onBeforeMount, inject } from 'vue';
import { Icon } from '@iconify/vue';
import Authenticated from '@/layouts/Authenticated.vue';
import NotificationArea from '@/components/NotificationArea.vue';
import Notification from '@/components/Notification.vue';
import { useAuthStore } from '@/stores/auth';
import endpoints from '@/modules/endpoints';
import { useNotification } from '@/composables/notification';

const http = inject('http');
const auth = useAuthStore();
const loading = ref(false);
const {
	notifications,
	addNotification,
	removeNotification,
	pauseNotification,
	resumeNotification,
} = useNotification();

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
			addNotification({
				type: 'success',
				title: 'Cache purge successful',
				message: 'The cache has been purged successfully.',
			});
		})
		.catch((error) => {
			addNotification({
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
	auth?.guard();
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
			v-for="notification in notifications ?? []"
			:key="notification?.id"
			:type="notification?.type"
			:title="notification?.title"
			@close="removeNotification(notification?.id)"
			@enter="pauseNotification(notification?.id)"
			@leave="resumeNotification(notification?.id)"
			>{{ notification?.message }}</Notification
		>
	</NotificationArea>
</template>
