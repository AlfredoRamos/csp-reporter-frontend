import { computed, ref } from 'vue';
import { v7 as uuidv7 } from 'uuid';
import { isValidUuidv7 } from '@/modules/utils';

export const useNotification = () => {
	const allowedTypes = ['info', 'success', 'warning', 'error'];
	const notificationList = ref([]);

	const notifications = computed(() => {
		return notificationList.value;
	});

	const addNotification = (data = {}) => {
		data = data instanceof Object ? data : {};
		data.id = uuidv7();
		data.timeout ??= 5000;

		notificationList.value?.push({
			id: data?.id,
			type: allowedTypes?.includes(data?.type ?? '')
				? data?.type
				: allowedTypes?.[0],
			title: data?.title ?? '',
			message: data?.message ?? '',
			timeout: data?.timeout,
			timer: setTimeout(
				() => removeNotification(data?.id),
				data?.timeout,
			),
		});
	};

	const removeNotification = (id) => {
		if (!isValidUuidv7(id)) {
			return;
		}

		notificationList.value = notificationList.value?.filter(
			(item) => item?.id !== id,
		);
	};

	const pauseNotification = (id) => {
		if (!isValidUuidv7(id)) {
			return;
		}

		const notification = notificationList.value.find(
			(item) => item?.id === id,
		);

		if (notification) {
			clearTimeout(notification?.timer);
		}
	};

	const resumeNotification = (id) => {
		if (!isValidUuidv7(id)) {
			return;
		}

		const notification = notificationList.value.find(
			(item) => item?.id === id,
		);

		if (notification) {
			notification.timer = setTimeout(
				() => removeNotification(id),
				notification?.timeout,
			);
		}
	};

	return {
		notifications,
		addNotification,
		removeNotification,
		pauseNotification,
		resumeNotification,
	};
};
